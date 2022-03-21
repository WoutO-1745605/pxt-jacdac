namespace jacdac {
    // Service Power supply constants
    export const SRV_POWER_SUPPLY = 0x1f40375f
    export const enum PowerSupplyReg {
        /**
         * Read-write bool (uint8_t). Turns the power supply on with `true`, off with `false`.
         *
         * ```
         * const [enabled] = jdunpack<[number]>(buf, "u8")
         * ```
         */
        Enabled = 0x1,

        /**
         * Read-write mV i22.10 (int32_t). The current output voltage of the power supply. Values provided must be in the range `minimum_voltage` to `maximum_voltage`
         *
         * ```
         * const [outputVoltage] = jdunpack<[number]>(buf, "i22.10")
         * ```
         */
        OutputVoltage = 0x2,

        /**
         * Constant mV i22.10 (int32_t). The minimum output voltage of the power supply. For fixed power supplies, `minimum_voltage` should be equal to `maximum_voltage`.
         *
         * ```
         * const [minimumVoltage] = jdunpack<[number]>(buf, "i22.10")
         * ```
         */
        MinimumVoltage = 0x110,

        /**
         * Constant mV i22.10 (int32_t). The maximum output voltage of the power supply. For fixed power supplies, `minimum_voltage` should be equal to `maximum_voltage`.
         *
         * ```
         * const [maximumVoltage] = jdunpack<[number]>(buf, "i22.10")
         * ```
         */
        MaximumVoltage = 0x111,
    }

}