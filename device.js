(async (Scratch) => {
    const vm = Scratch.vm;
    const runtime = vm.runtime;

    class MyExtension {
        getInfo() {
            return {
                id: 'device',
                name: 'デバイス',
                blocks: [
                    {
                        opcode: 'dis',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'デバイスが横か'
                    },
                    {
                        opcode: 'exeeval',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'eval[code]',
                        args: [
                            code: {
                                type: Scratch.ArgType.STRING
                            }
                        ]
                    },
                    {
                        opcode: 'repoeval',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'eval[code]',
                        args: [
                            code: {
                                type: Scratch.ArgType.STRiNG
                            }
                        ]
                    },
                ]
            };
        }
    
        dis() {
            return window.matchMedia("(orientation: landscape)").matches;
        }
        // コマンドブロック用（値を返さなくていい）
        exeeval(args) {
            const code = args.code;
            try {
                const fn = new Function(code);
                fn();
            } catch (e) {
                console.error("Eval Error: " + e.message);
            }
        },
        // レポーターブロック用（値を返す）
        repoeval(args) {
            const code = args.code;
            try {
                // まずはそのまま Function で試す
                const fn = new Function(code);
                const result = fn();
                // もし return がなくて undefined になった場合は、"return " を補ってもう一度試す
                if (result === undefined) {
                    const fnWithReturn = new Function(`return ${code};`);
                    return fnWithReturn();
                }
                return result;
            } catch (e) {
                return "Error: " + e.message;
            }
        }
    }
    Scratch.extensions.register(new MyExtension());
})(Scratch);
