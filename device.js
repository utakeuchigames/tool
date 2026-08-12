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
                ]
            };
        }
    
        dis() {
            return window.matchMedia("(orientation: landscape)").matches;
        }
    }
    Scratch.extensions.register(new MyExtension());
})(Scratch);
