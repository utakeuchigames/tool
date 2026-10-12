(async (Scratch) => {
    "use strict";
    let deltaTime = 0;
    let previousTime = 0;
    class Gamekit {
        static customId = "gamekit";
        constructor() {
            this.customId = Gamekit.customId;
            this.type = Gamekit.customId;
            this.frameCount = 0;
            this.initLoop();
        }
        getInfo() {
            return {
                id: Gamekit.customId,
                name: "Gamekit",
                blocks: [
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
                            fps: {
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
            };
        }
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
        setFps(args) { Scratch.vm.runtime.frameLoop.setFramerate(args["fps"]); }
        fps() { return Scratch.vm.runtime.frameLoop.framerate; }
    }
})