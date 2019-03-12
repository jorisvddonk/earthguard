const ShipSubsystem = require("../shipSubsystem");

class SensorSubsystem extends ShipSubsystem {
    constructor(ship, options) {
        super(ship);
        options = Object.assign({
        }, options);
        this.subsystemType = "sensor";
        ship.addEventListener('hit', (evt) => {
            // TODO: register hit in Memory subsystem!
        })
    }
};

module.exports = SensorSubsystem;
