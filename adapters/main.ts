namespace testAdapters {
    export class AButton extends jacdac.SensorServer {
        readonly src: modules.ButtonClient
        protected state: "up" | "down_click" | "up_click" | "down_held" = "up"

        // TODO this is only used to gate timeouts using threading + wait.
        // A better solution would be to terminate threads so they don't fire when they're obsoleted.
        // TODO if keeping this architecture, perhaps this needs to be more specific, eg clickTimeoutCounter
        protected eventCounter: number = 0

        // counter to detect double-clicks and the like
        // reset upon a event being generated
        protected clickCounter: number = 0

        static readonly clickTimeoutMs: number = 200
        static readonly multiClickTimeoutMs: number = 200

        constructor(dev: string, src: modules.ButtonClient) {
            super(dev, jacdac.SRV_BUTTON_GESTURE);
            this.src = src
        }
        public serializeState(): Buffer {
            // let pressed = input.buttonIsPressed(this.button);
            return jacdac.jdpack("u16", [0xffff]);  // this probably doesn't actually run
        }

        public start() {
            super.start()
            this.state = "up"

            this.src.onDown( function () {
                this.eventCounter += 1
                let thisEventCount: number = this.eventCounter
                this.state = "down_click"

                control.runInParallel( () => {
                    basic.pause(AButton.clickTimeoutMs)
                    if (this.eventCounter == thisEventCount) {
                        if (this.clickCounter == 0) {
                            this.sendEvent(jacdac.ButtonGestureEvent.ClickHold)
                        } else {
                            this.sendEvent(jacdac.ButtonGestureEvent.MultiClickHold)
                        }

                        this.state = "down_held"
                    }
                })
            })

            this.src.onUp( function () {
                if (this.state == "down_click") {
                    this.eventCounter += 1
                    let thisEventCount: number = this.eventCounter
                    this.clickCounter += 1
                    this.state = "up_click"

                    if (this.clickCounter == 1) {
                        this.sendEvent(jacdac.ButtonGestureEvent.Click)
                    } else if (this.clickCounter == 2) {
                        this.sendEvent(jacdac.ButtonGestureEvent.DoubleClick)
                    } else {
                        this.sendEvent(jacdac.ButtonGestureEvent.MultiClick)
                    }

                    control.runInParallel( () => {
                        basic.pause(AButton.multiClickTimeoutMs)
                        if (this.eventCounter == thisEventCount) {
                            this.state = "up"
                            this.clickCounter = 0
                        }
                    })
                } else if (this.state == "down_held") {
                    this.sendEvent(jacdac.ButtonGestureEvent.HoldRelease)
                    
                    this.state = "up"
                    this.clickCounter = 0
                }
            })
        }
    }

    //% fixedInstance whenUsed block="buttonDucks"
    export const buttonDucks = new testAdapters.AButton("buttonDucks", modules.button1);

    //% fixedInstance whenUsed block="buttonDucksClient"
    export const buttonDucksClient = new modules.ButtonGestureClient("buttonDucksClient")
}


// servers.startAll()

servers.buttonA.start()
servers.buttonB.start()
servers.buttonLogo.start()

testAdapters.buttonDucks.start()


basic.showIcon(IconNames.Duck)


testAdapters.buttonDucksClient.onClick(function () {
    modules.ledPixel1.setPixel(0, 0xff0000)
})
testAdapters.buttonDucksClient.onDoubleClick(function () {
    modules.ledPixel1.setPixel(0, 0x00ff00)
})

testAdapters.buttonDucksClient.onClickHold(function () {
    modules.ledPixel1.setPixel(0, 0xffff00)
})
testAdapters.buttonDucksClient.onHoldRelease(function () {
    modules.ledPixel1.setPixel(0, 0xffffff)
})

// basic.showIcon(IconNames.Heart)

// basic.forever(function () {
	
// })
