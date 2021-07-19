namespace servers {
    // Service: LED Matrix
    const SRV_LED_MATRIX = 0x110d154b
    const enum LedMatrixReg {
        /**
         * Read-write bytes. The state of the screen where pixel on/off state is
         * stored as a bit, column by column. The column should be byte aligned.
         *
         * ```
         * const [leds] = jdunpack<[Buffer]>(buf, "b")
         * ```
         */
        Leds = 0x2,

        /**
         * Read-write ratio u0.8 (uint8_t). Reads the general brightness of the LEDs. ``0`` when the screen is off.
         *
         * ```
         * const [brightness] = jdunpack<[number]>(buf, "u0.8")
         * ```
         */
        Brightness = 0x1,

        /**
         * Constant # uint16_t. Number of rows on the screen
         *
         * ```
         * const [rows] = jdunpack<[number]>(buf, "u16")
         * ```
         */
        Rows = 0x181,

        /**
         * Constant # uint16_t. Number of columns on the screen
         *
         * ```
         * const [columns] = jdunpack<[number]>(buf, "u16")
         * ```
         */
        Columns = 0x182,
    }

    export class ScreenServer extends jacdac.Server {
        constructor() {
            super("screen", SRV_LED_MATRIX)
        }

        handlePacket(packet: jacdac.JDPacket) {
            if (packet.regCode == LedMatrixReg.Leds) {
                if (packet.isRegSet) {
                    let x = 0,
                        y = 0
                    for (let i = 0; i < 25; i++) {
                        let byte = Math.floor(i / 5)
                        let bit = 1 << (i - byte * 5)
                        if (packet.data[byte] & bit) led.plot(x, y)
                        else led.unplot(x, y)
                        x++
                        if (x == 5) {
                            x = 0
                            y++
                        }
                    }
                } else {
                    let x = 0,
                        y = 0
                    let buf = Buffer.create(5)
                    for (let i = 0; i < 25; i++) {
                        if (led.point(x, y)) {
                            let byte = Math.floor(i / 5)
                            let bit = 1 << (i - byte * 5)
                            buf[byte] |= bit
                        }
                        x++
                        if (x == 5) {
                            x = 0
                            y++
                        }
                    }
                    this.handleRegBuffer(packet, packet.regCode, buf)
                }
            } else if (
                packet.regCode == LedMatrixReg.Rows ||
                packet.regCode == LedMatrixReg.Columns
            ) {
                this.handleRegValue(packet, packet.regCode, "u16", 5)
            } else if (packet.regCode === LedMatrixReg.Brightness) {
                const b = led.brightness() / 255.0
                const nb = this.handleRegValue(
                    packet,
                    packet.regCode,
                    "u0.8",
                    b
                )
                if (b !== nb)
                    led.setBrightness(nb << 8)
            }
        }
    }

    //% fixedInstance whenUsed block="screen"
    export const screenServer = new ScreenServer()
}
