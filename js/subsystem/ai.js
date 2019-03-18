const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem");
const ObjectRegistry = require("../objectRegistry");

class AISubsystem extends ShipSubsystem {
    constructor(ship, options) {
        super(ship);
        this.subsystemType = "ai";
        this.target = null;
        options = Object.assign({}, options);
    }

    tick() {
        if (this.target !== null) {
            if (!ObjectRegistry.has(this.target)) {
                console.log("Target lost", this.target)
                this.target = null;
            }
        }
    }

    getTarget() {
        return ObjectRegistry.get(this.target) || null;
    }

    setTarget(target) {
        if (target && !target.hasOwnProperty('_objid')) {
            throw new Error(`Target has no object ID: ${target}`);
        }
        this.target = target._objid;
        const evt = new createjs.Event("ai_targetChanged", false, false);
        evt.data = { target };
        this.ship.dispatchEvent(evt);
    }
};

module.exports = AISubsystem;
