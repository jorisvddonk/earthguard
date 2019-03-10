const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem");

class HullSubsystem extends ShipSubsystem {
    constructor(options) {
        super()
        options = Object.assign({
            maxIntegrity: 1000,
        }, options);
        this.subsystemType = "hull";
        this.integrity = options.maxIntegrity;
        this.maxIntegrity = options.maxIntegrity;
    }

    tick() {
        // todo implement
    };

    takeDamage(amount) {
        this.integrity -= amount;
    }
};

module.exports = HullSubsystem;
