const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem");

class SensorSubsystem extends ShipSubsystem {
    constructor(ship, options) {
        super()
        options = Object.assign({
        }, options);
        this.subsystemType = "sensor";
        ship.addEventListener('hit', (evt) => {
            // TODO: register hit in Memory subsystem!
        })
    }
};

module.exports = SensorSubsystem;
