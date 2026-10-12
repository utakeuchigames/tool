(async (Scratch) => {
    "use strict";
    const version = "1.1.0";
    const ispenguin = Scratch.extensions.isPenguinMod ?? false;
    const icon = "https://utakeuchigames.github.io/boolvariable/favicon.svg";
    class Boolvariable {
        static customId = "boolvariable";
        serialize() { return { boolVariables: this.boolVariables, boolVariablesinfo: this.boolVariablesinfo, }; }
        deserialize(data) {
            this.boolVariables = data.boolVariables;
            this.boolVariablesinfo = data.boolVariablesinfo;
        }
        constructor() {
            this.boolVariables = {};
            this.boolVariablesinfo = {};
            this.isUIOpen = false;
            this.isDelUIOpen = false;
            this.customId = Boolvariable.customId;
            this.type = Boolvariable.customId;
        }
        refreshBlocks() {
            setTimeout(() => {
                Scratch.vm.extensionManager.refreshBlocks("BV");
            }, 5);
        }
        ensureVariableExists(internalKey) {
            if (Object.prototype.hasOwnProperty.call(this.boolVariables, internalKey)) {
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
            this.boolVariablesinfo[internalKey] = {
                isLocal: isLocal,
                targetId: targetId,
                displayName: displayName,
            };
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
                blocks: [
                    {
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
                                type: Scratch.ArgumentType.BOOLEAN,
                            },
                        },
                    },
                    {
                        opcode: "andbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] && [bool2]",
                        arguments: {
                            bool1: {
                                type: Scratch.ArgumentType.BOOLEAN,
                            },
                            bool2: {
                                type: Scratch.ArgumentType.BOOLEAN,
                            },
                        },
                    },
                    {
                        opcode: "orbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] || [bool2]",
                        arguments: {
                            bool1: {
                                type: Scratch.ArgumentType.BOOLEAN,
                            },
                            bool2: {
                                type: Scratch.ArgumentType.BOOLEAN,
                            },
                        },
                    },
                    {
                        opcode: "xorbool",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "[bool1] !== [bool2]",
                        arguments: {
                            bool1: {
                                type: Scratch.ArgumentType.BOOLEAN,
                            },
                            bool2: {
                                type: Scratch.ArgumentType.BOOLEAN,
                            },
                        },
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
                        items: [
                            {
                                text: "true",
                                value: "true",
                            },
                            {
                                text: "false",
                                value: "false",
                            },
                        ],
                    },
                },
            };
        }
        createUI() {
            try {
                const self = this;
                myScratchBlocks.prompt(
                    "新しい変数名:",
                    "",
                    (name, more_vars, { scope }) => {
                        if (!name || name.trim() === "") {
                            return;
                        }
                        const trimmedName = name.trim();
                        const editingTarget = Scratch.vm.runtime.getEditingTarget();
                        const currentTargetId = editingTarget ? (editingTarget.id ?? "stage") : "stage";
                        const isLocal = scope === "local";
                        const targetId = isLocal ? currentTargetId : "stage";
                        const internalKey = isLocal ? `${targetId}_${trimmedName}` : trimmedName;
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
                        self.boolVariablesinfo[internalKey] = {
                            isLocal: isLocal,
                            targetId: targetId,
                            displayName: trimmedName,
                        };
                        this.refreshBlocks();
                        return;
                    },
                    "新しい変数",
                    Boolvariable.customId,
                );
            } catch (err) {}
        }
        getVariableMenuItems(currentlySelectedValue) {
            const menuItems = [];
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const currentTargetId = currentTarget ? (currentTarget.id ?? "stage") : "stage";
            const variableKeys = Object.keys(this.boolVariables).filter((key) => {
                const info = this.boolVariablesinfo[key];
                if (!info) return true;
                return !info.isLocal || info.targetId === currentTargetId;
            });
            if (variableKeys.length > 0) {
                for (const key of variableKeys) {
                    const info = this.boolVariablesinfo[key];
                    const dispName = info ? (info.displayName ?? key) : key;
                    menuItems.push({ text: dispName, value: key });
                }
                menuItems.push({
                    text: "変数を削除するフォームを開く",
                    value: "OPEN_DELETE_UI",
                });
            } else {
                menuItems.push({ text: "(空)", value: "(空)" });
            }
            return menuItems;
        }
        async createDeleteUI() {
            const currentTarget = Scratch.vm.runtime.getEditingTarget();
            const currentTargetId = currentTarget ? (currentTarget.id ?? "stage") : "stage";
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
                const typeText = info ? (info.isLocal ? "[ローカル]" : "[グローバル]") : "[不明]";
                const option = document.createElement("option");
                option.value = key;
                option.textContent = `${typeText} ${dispName}`;
                select.appendChild(option);
            });
            const modal = await myScratchBlocks.customPrompt(
                {
                    title: "変数の削除",
                    text: "削除する変数を選択してください:",
                    onCancel: () => {
                        this.isDelUIOpen = false;
                    },
                },
                { content: { width: "300px" } },
                [
                    {
                        name: "削除",
                        role: "ok",
                        callback: () => {
                            const selectedKey = select.value;
                            if (!selectedKey) return;
                            const dispname = select.options[select.selectedIndex].text;
                            if (confirm(`本当に bool値「${dispname}」を完全に削除しますか？`)) {
                                delete this.boolVariables[selectedKey];
                                delete this.boolVariablesinfo[selectedKey];
                                alert(`🎉 bool値「${dispname}」を完全に削除しました！`);
                                this.refreshBlocks();
                            }
                            this.isDelUIOpen = false;
                            this.refreshBlocks();
                        },
                    },
                    {
                        name: "キャンセル",
                        role: "close",
                        callback: () => {
                            this.isDelUIOpen = false;
                        },
                    },
                ],
            );
            modal.appendChild(select);
        }
        setBool(args, util) {
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
            if (args.variable === "IGNORE_CLICK" || args.variable === "(空)") return false;
            this.ensureVariableExists(args.variable);
            return !!this.boolVariables[args.variable];
        }
        ifBool(args, util) {
            if (args.variable === "IGNORE_CLICK" || args.variable === "(空)") return false;
            return args.variable === util.currentBackgroundData.variable && args.bool === util.currentBackgroundData.bool;
        }
        reversebool(args) { return !args.bool; }
        andbool(args) { return !!(args.bool1 && args.bool2); }
        orbool(args) { return !!(args.bool1 || args.bool2); }
        xorbool(args) { return args.bool1 !== args.bool2; }
    }
    Scratch.extensions.register(new Boolvariable());
})(Scratch);
