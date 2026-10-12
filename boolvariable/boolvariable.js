(async (Scratch) => {
    "use strict";
    const version = '1.1.0';
    const ispenguin = Scratch.extensions.isPenguinMod ?? false;
    const icon = "https://utakeuchigames.github.io/boolvariable/favicon.svg";
    let deltaTime = 0;
    let previousTime = 0;
    let myScratchBlocks;
    if (Scratch.gui) {
        await Scratch.gui.getBlockly().then((ScratchBlocks) => {
            myScratchBlocks = ScratchBlocks;
        });
    }
    class Boolvariable {
        static customId = "boolvariable";
        serialize() {
            return {
                boolVariables: this.boolVariables,
                boolVariablesinfo: this.boolVariablesinfo,
            };
        }
        deserialize(data) {
            this.boolVariables = data.boolVariables;
            this.boolVariablesinfo = data.boolVariablesinfo;
        }
        constructor() {
            this.boolVariables = {};
            this.boolVariablesinfo = {};
            this.isUIOpen = false;
            this.isDelUIOpen = false;
            this.frameCount = 0;
            this.customId = Boolvariable.customId;
            this.type = Boolvariable.customId;
            injectStyles();
            this.initLoop();
            this.jQueryinstaller();
        }
        async jQueryinstaller() {
            try {
                const mod = await import("https://code.jquery.com/jquery-4.0.0.module.min.js");
                const $ = mod.default;
                window.$ = $;
                this.isLoaded = true;
            } catch (e) {
                this.isLoaded = false;
                console.warn("jQueryのロードに失敗しました:", e);
                console.warn("jQueryのロードに失敗したため、機能が一部利用不可能となります");
            }
        }
        refreshBlocks() {
            setTimeout(() => {
                Scratch.vm.extensionManager.refreshBlocks("BV");
            }, 5);
        }
        ensureVariableExists(internalKey) {
            if (Object.prototype.hasOwnProperty.call(this.boolVariables,internalKey)) {
                return;
            }
            let displayName = internalKey;
            let isLocal = false;
            let targetId = "stage";
            if (internalKey.includes("_")) {
                const lastIndex = internalKey.lastIndexOf("_");
                isLocal = true;
                targetId = internalKey.substring(0, lastIndex);
                displayName = internalKey.substring(lastIndex + 1);
            } else {
                displayName = internalKey;
                isLocal = false;
                targetId = "stage";
            }
            this.boolVariables[internalKey] = false;
            this.boolVariablesinfo[internalKey] = {isLocal: isLocal,targetId: targetId,displayName: displayName,};
            this.refreshBlocks();
        }
        getInfo() {
            return {
                id: "BV",
                name: "boolvariable",
                menuIconURI: icon,
                color1: "#ff8c1a",
                color2: "#ff8000",
                color3: "#db6d00",
                blocks: [{
                    blockType: Scratch.BlockType.LABEL,
                    text: "真偽値変数",
                },
                    {
                        func: "createUI",
                        blockType: Scratch.BlockType.BUTTON,
                        text: "変数作成フォームを開く",
                    },
                    {
                        opcode: "setBool",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "bool値[variable]を[bool]にする",
                        arguments: {
                            variable: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "boolVariableMenu",
                            },
                            bool: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "staticBoolMenu",
                            },
                        },
                    },
                    {
                        opcode: "getBool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "bool値[variable]",
                        arguments: {
                            variable: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "boolVariableMenu",
                            },
                        },
                    },
                    {
                        opcode: "ifBool",
                        blockType: Scratch.BlockType.EVENT,
                        text: "bool値[variable]が[bool]になった時",
                        isEdgeActivated: false,
                        arguments: {
                            variable: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "boolVariableHatMenu",
                            },
                            bool: {
                                type: Scratch.ArgumentType.STRING,
                                menu: "staticBoolMenu",
                            },
                        },
                    },
                    {
                        opcode: "getallBool",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "全部のbool値を見る",
                    },
                    {
                        opcode: "getallboolinfo",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "全部のbool値の情報を見る",
                    },
                    "---",
                    {
                        blockType: Scratch.BlockType.LABEL,
                        text: "その他のキット",
                    },
                    {
                        opcode: "reversebool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "![bool]",
                        arguments: {
                            bool: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                        },
                    },
                    {
                        opcode: "andbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] && [bool2]",
                        arguments: {
                            bool1: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                            bool2: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                        },
                    },
                    {
                        opcode: "orbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] || [bool2]",
                        arguments: {
                            bool1: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                            bool2: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                        },
                    },
                    {
                        opcode: "xorbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] !== [bool2]",
                        arguments: {
                            bool1: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                            bool2: {
                                type: Scratch.ArgumentType.BOOLEAN
                            },
                        },
                    },
                    {
                        opcode: "waitFrames",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "[frames] フレーム待つ",
                        arguments: {
                            frames: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 1,
                            },
                        },
                    },

                    {
                        opcode: "setFps",
                        text: "fpsを [fps] にする",
                        blockType: "command",
                        arguments: {
                            "fps": {
                                type: "number",
                                defaultValue: 30,
                            },
                        },
                    },
                    {
                        opcode: "fps",
                        text: "fps",
                        blockType: "reporter",
                        arguments: {},
                    },
                ],
                menus: {
                    boolVariableMenu: {
                        acceptReporters: false,
                        items: "getVariableMenuItems",
                    },
                    boolVariableHatMenu: {
                        acceptReporters: false,
                        items: "getVariableMenuItems",
                    },
                    staticBoolMenu: {
                        acceptReporters: false,
                        items: [{
                            text: "true",
                            value: "true"
                        },
                            {
                                text: "false",
                                value: "false"
                            },
                        ],
                    },
                },
            };
        }
        createUI() {
            try {
                const self = this;
                myScratchBlocks.prompt("新しい変数名:","",(name, more_vars, {scope}) => {
                    if (!name || name.trim() === "") {
                        return;
                    }
                    const trimmedName = name.trim();
                    const editingTarget =
                    Scratch.vm.runtime.getEditingTarget();
                    const currentTargetId = editingTarget ? (editingTarget.id ?? "stage"): "stage";
                    const isLocal = scope === "local";
                    const targetId = isLocal ? currentTargetId: "stage";
                    const internalKey = isLocal ? `${targetId}_${trimmedName}`: trimmedName;
                    for (const key of Object.keys(self.boolVariablesinfo)) {
                        const info = self.boolVariablesinfo[key];
                        if (info.displayName === trimmedName) {
                            if (!isLocal && !info.isLocal) {
                                alert(`「${trimmedName}」は既に存在します`);
                                return;
                            }
                            if (isLocal && info.isLocal && info.targetId === targetId) {
                                alert(`「${trimmedName}」は既に存在します`);
                                return;
                            }
                        }
                    }
                    self.boolVariables[internalKey] = false; // ← typo 修正
                    self.boolVariablesinfo[internalKey] = {isLocal: isLocal,targetId: targetId,displayName: trimmedName,};
                    this.refreshBlocks();
                    return;
                },"新しい変数",Boolvariable.customId,);
            } catch (err) {}
        }
        getVariableMenuItems(currentlySelectedValue) {
            const menuItems = [];
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const currentTargetId = currentTarget ? (currentTarget.id ?? "stage"): "stage";
            const variableKeys = Object.keys(this.boolVariables).filter((key) => {
                const info = this.boolVariablesinfo[key];
                if (!info) return true;
                return !info.isLocal || info.targetId === currentTargetId;
            });
            if (variableKeys.length > 0) {
                for (const key of variableKeys) {
                    const info = this.boolVariablesinfo[key];
                    const dispName = info ? (info.displayName ?? key): key;
                    menuItems.push({text: dispName, value: key});
                }
                menuItems.push({text: "変数を削除するフォームを開く", value: "OPEN_DELETE_UI"});
            } else {
                menuItems.push({text: "(空)", value: "(空)"});
            }
            return menuItems;
        }
        async createDeleteUI() {
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const currentTargetId = currentTarget ? (currentTarget.id ?? "stage"): "stage";
            const deleteableKeys = Object.keys(this.boolVariables).filter((internalKey) => {
                    const info = this.boolVariablesinfo[internalKey];
                    if (!info) return true;
                    return !info.isLocal || info.targetId === currentTargetId;
            });
            if (deleteableKeys.length === 0) {
                alert("❌ このスプライトで削除できる変数がありません！");
                return;
            }
            const select = document.createElement("select");
            select.style.width = "100%";
            select.style.padding = "8px";
            select.style.marginBottom = "20px";
            deleteableKeys.forEach((key) => {
                const info = this.boolVariablesinfo[key];
                const dispName = info?.displayName || key;
                const typeText = info ? info.isLocal ? "[ローカル]": "[グローバル]": "[不明]";
                const option = document.createElement("option");
                option.value = key;
                option.textContent = `${typeText} ${dispName}`;
                select.appendChild(option);
            });
            const modal = await myScratchBlocks.customPrompt(
                {title: "変数の削除", text: "削除する変数を選択してください:", onCancel: () => {this.isDelUIOpen = false;}},
                {content: {width: "300px"},},
                [{name: "削除", role: "ok", callback: () => {
                    const selectedKey = select.value;
                    if (!selectedKey) return;
                    const dispname = select.options[select.selectedIndex].text;
                        if (confirm(`本当に bool値「${dispname}」を完全に削除しますか？`)) {
                            delete this.boolVariables[selectedKey];
                            delete this.boolVariablesinfo[selectedKey];
                            alert(`🎉 bool値「${dispname}」を完全に削除しました！`,);
                            this.refreshBlocks();
                        }
                        this.isDelUIOpen = false;
                        this.refreshBlocks();
                    },
                },{name: "キャンセル",
                        role: "close",
                        callback: () => {
                            this.isDelUIOpen = false;
                        },
                    },
                ],
            );
            modal.appendChild(select);
        }
        createDeleteUI_turbowarp() {
            if (this.isDelUIOpen) return;
            this.isDelUIOpen = true;
            setTimeout(() => {
                const currentTarget = Scratch.vm.runtime.getEditingTarget();
                const currentTargetId = currentTarget ? (currentTarget.id ?? 'stage'): 'stage';
                const deleteableKeys = Object.keys(this.boolVariables).filter(internalKey => {
                    const info = this.boolVariablesinfo[internalKey];
                    if (!info) return true;
                    return !info.isLocal || info.targetId === currentTargetId;
                });
                if (deleteableKeys.length === 0) {
                    alert("❌ 削除できる変数がありません！");
                    this.isDelUIOpen = false;
                    return;
                }
                const overlay = document.createElement('div');
                overlay.style.cssText = `position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background-color:rgba(0,0,0,0.6);display:flex;justify-content:center;align-items:center;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;`;
                const dialog = document.createElement('div');
                dialog.style.cssText = `background-color:#ffffff;width:340px;border:4px solid #ff4c4c;border-radius:0.5rem;overflow:hidden;display:flex;flex-direction:column;box-shadow:0px 4px 15px rgba(0,0,0,0.3);`;
                let optionsHtml = '';
                for (const key of deleteableKeys) {
                    const info = this.boolVariablesinfo[key];
                    const disp = info ? (info.displayName ?? key): key;
                    const typeText = info ? (info.isLocal ? '[ローカル]': '[グローバル]'): '[不明]';
                    optionsHtml += `<option value="${key}">${typeText} ${disp}</option>`;
                }
                dialog.innerHTML = `
                <div style="height:3rem;background-color:#ff4c4c;color:#ffffff;display:flex;justify-content:center;align-items:center;font-weight:bold;font-size:1rem;">
                変数の削除
                </div>
                <div style="padding:1.5rem;display:flex;flex-direction:column;">
                <div style="font-size:14px;color:#575e75;margin-bottom:0.75rem;text-align:left;">削除する変数を選択してください:</div>
                <select id="deleteSelect" style="width:100%;height:2.5rem;border:1px solid #ccc;border-radius:4px;padding:0 0.5rem;font-size:14px;margin-bottom:1.5rem;background:#fff;outline:none;color:#000;">
                ${optionsHtml}
                </select>
                <div style="text-align:right;">
                <button id="cancelDelBtn" style="padding:0.5rem 1rem;border-radius:4px;background:#fff;color:#333;border:1px solid #ccc;font-weight:600;cursor:pointer;outline:none;">キャンセル</button>
                <button id="executeDelBtn" style="padding:0.5rem 1rem;border-radius:4px;background:#ff4c4c;color:#fff;border:none;font-weight:600;cursor:pointer;outline:none;margin-left:0.5rem;">削除実行</button>
                </div>
                </div>
                `;
                overlay.appendChild(dialog);
                document.body.appendChild(overlay);
                const closeDel = () => {
                    overlay.remove();
                    this.isDelUIOpen = false;
                };
                document.getElementById('cancelDelBtn').onclick = closeDel;
                overlay.onclick = (e) => {
                    if (e.target === overlay) closeDel();
                };
                document.getElementById('executeDelBtn').onclick = () => {
                    const targetKey = document.getElementById('deleteSelect').value;
                    const info = this.boolVariablesinfo[targetKey];
                    const dispName = info ? (info.displayName ?? targetKey): targetKey;

                    if (confirm(`本当に bool値「${dispName}」を完全に削除しますか？\n(この変数を使用している他のブロックは初期状態に戻ります)`)) {
                        delete this.boolVariables[targetKey];
                        delete this.boolVariablesinfo[targetKey];
                        closeDel();
                        setTimeout(() => {
                            alert(`🎉 bool値「${dispName}」を完全に削除しました！`);
                            this.refreshBlocks();
                        }, 100);
                        return;
                    }
                    closeDel();
                };
            },100);
        }
        test() {
            /*
            const modalCss = `<style>
                .custom-modal{position:fixed;bottom:0;left:50%;transform:translateX(-50%) translateY(0);width:90%;max-width:500px;height:400px;border-top-left-radius:20px;border-top-right-radius:20px;background:#fff;box-shadow:0 -4px 20px rgba(0,0,0,0.15);display:flex;flex-direction:column;z-index:9999;box-sizing:border-box;transition:transform 0.3s cubic-bezier(0.25,1,0.5,1);touch-action:none;user-select:none;-webkit-user-select:none;}
                .custom-modal.dragging{transition:none;}
                .modal-handle-area{padding:12px 0;cursor:grab;touch-action:none;display:flex;justify-content:center;align-items:center;flex-shrink:0;}
                .modal-handle-bar{width:60px;height:6px;background:#d1d5db;border-radius:10px;pointer-events:none;}
                .modal-content{flex:1;overflow-y:auto;padding:10px 20px 20px;box-sizing:border-box;touch-action:pan-y;}
            </style>`;
            $("head").append(modalCss);
            $("body").append(
               `<div class="custom-modal">
                    <div class="modal-handle-area">
                        <div class="modal-handle-bar"></div>
                    </div>
                    <div class="modal-content">
                        <p>コンテンツ</p>
                    </div>
                </div>`,
            );
            const $m = $(".custom-modal"),
                h = $m.outerHeight();
            let sy = 0,
                cy = 0,
                flag = false;
            $(".modal-handle-area").on("touchstart mousedown", (e) => {
                flag = true;
                $m.addClass("dragging");
                sy = e.type === "touchstart" ? e.touches[0].clientY : e.clientY;
                cy = 0;
            });
            $(window).on("touchmove mousemove", (e) => {
                if (!flag) return;
                cy = Math.max(
                    0,
                    (e.type === "touchmove"
                        ? e.touches[0].clientY
                        : e.clientY) - sy,
                );
                $m.css("transform", `translateX(-50%) translateY(${cy}px)`);
            });
            $(window).on("touchend mouseup", () => {
                if (!flag) return;
                flag = false;
                $m.removeClass("dragging");
                if (1 - cy / h >= 0.7) {
                    $m.css("transform", "translateX(-50%) translateY(0px)");
                } else {
                    $m.css("transform", `translateX(-50%) translateY(${h}px)`);
                    setTimeout(() => $m.remove(), 300);
                }
            });
            */
            createCustomModal({
                title: "新しい変数",
                text: "新しい変数名:",
                extraHtml: `
                <input type="text" id="modal-input" placeholder="" style="width:100%;padding:10px;margin-bottom:15px;border:1px solid #d1d5db;border-radius:8px;box-sizing:border-box;">
                <label style="display:block;margin-bottom:10px;"><input type="radio" name="opt" value="global" checked>すべてのスプライト用</label>
                <label style="display:block;margin-bottom:10px;"><input type="radio" name="opt" value="local">このスプライト用</label>
                `,
                customCss: `
                .custom-modal input[type="text"]:focus {
                border-color: #3b82f6;
                outline: none;
                }
                `
            });
        }
        setBool(args,util) {
            if (args.variable === "OPEN_DELETE_UI") {
                this.createDeleteUI();
                return;
            }
            if (args.variable === "OPEN_TEST_UI") {
                this.test();
                return;
            }
            if (args.variable === "(空)") return;
            this.ensureVariableExists(args.variable);
            const prevalue = this.boolVariables[args.variable];
            this.boolVariables[args.variable] = args.bool === "true";
            const data = {
                variable: args.variable.toString(),
                bool: String(args.bool),
            };
            if (prevalue != (args.bool === "true")) {
                Scratch.vm.runtime.startHats("BV_ifBool", data, false);
            }
        }
        getBool(args, util) {
            if (args.variable === "OPEN_DELETE_UI") {
                this.createDeleteUI();
                return false;
            }
            if (args.variable === "IGNORE_CLICK" || args.variable === "(空)")
                return false;
            this.ensureVariableExists(args.variable);
            return !!this.boolVariables[args.variable];
        }
        ifBool(args, util) {
            if (args.variable === "IGNORE_CLICK" || args.variable === "(空)")
                return false;
            return (
                args.variable === util.currentBackgroundData.variable &&
                args.bool === util.currentBackgroundData.bool
            );
        }
        getallBool(args) {return JSON.stringify(this.boolVariables);}
        getallboolinfo(args) {return JSON.stringify(this.boolVariablesinfo);}
        reversebool(args, util) {return !args.bool;}
        andbool(args, util) {return !!(args.bool1 && args.bool2);}
        orbool(args, util) {return !!(args.bool1 || args.bool2);}
        xorbool(args, util) {return args.bool1 !== args.bool2;}
        initLoop() {
            const update = (now) => {
                this.frameCount++;
                if (this.previousTime === 0) {
                    this.deltaTime = 1 / 60;
                } else {
                    this.deltaTime = (now - this.previousTime) / 1000;
                }
                this.previousTime = now;
                requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        }
        async waitFrames(args, util) {
            const targetFrame = this.frameCount + args.frames - 1;
            while (this.frameCount < targetFrame) {
                await new Promise((resolve) => requestAnimationFrame(resolve));
            }
        }
        async setFps(args) {Scratch.vm.runtime.frameLoop.setFramerate(args["fps"]);}
        async fps(args) {return Scratch.vm.runtime.frameLoop.framerate;}
    }
    Scratch.extensions.register(new Boolvariable);
})(Scratch);
