(async (Scratch) => {
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
                        text: 'eval [code]',
                        arguments: {
                            code: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'console.log("hello");'
                            }
                        }
                    },
                    {
                        opcode: 'repoeval',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'eval [code]',
                        arguments: {
                            code: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '1 + 1'
                            }
                        }
                    }
                ]
            };
        }
    
        dis() {
            return window.matchMedia("(orientation: landscape)").matches;
        }

        exeeval(args) {
            try {
                const fn = new Function(args.code);
                fn();
            } catch (e) {
                console.error("Eval Error: " + e.message);
            }
        }

        repoeval(args) {
            try {
                const fn = new Function(args.code);
                const result = fn();
                if (result === undefined) {
                    const fnWithReturn = new Function(`return ${args.code};`);
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
