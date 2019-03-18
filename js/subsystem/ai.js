const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem");

class AISubsystem extends ShipSubsystem {
    constructor(ship, options) {
        super(ship);
        this.subsystemType = "ai";
        this.target = null;
        options = Object.assign({}, options);
    }

    setTarget(target) {
        this.target = target;
        const evt = new createjs.Event("ai_targetChanged", false, false);
        evt.data = { target };
        this.ship.dispatchEvent(evt);
    }
};

module.exports = AISubsystem;
