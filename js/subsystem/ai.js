const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem");
const ObjectRegistry = require("../objectRegistry");
const GameObject = require("../gameObject");
const Sylvester = require("../sylvester-withmods.js");

const TargetTypes = {
    GAMEOBJECT: "GAMEOBJECT",
    POSITION: "POSITION"
};

class AISubsystem extends ShipSubsystem {
    constructor(ship, options) {
        super(ship);
        this.subsystemType = "ai";
        this.target = null;
        this.targetType = null;
        options = Object.assign({}, options);
    }

    tick() {
        const GameObject = require("../gameObject");
        if (this.target !== null && this.targetType === TargetTypes.GAMEOBJECT) {
            if (!ObjectRegistry.has(this.target)) {
                console.log("Target lost", this.target)
                const evt = new createjs.Event("ai_targetLost", false, false);
                evt.data = { target: this.target };
                this.ship.dispatchEvent(evt);
                this.target = null;
            }
        }
    }

    getTarget() {
        if (this.targetType === TargetTypes.GAMEOBJECT) {
            return ObjectRegistry.get(this.target) || null;
        } else if (this.targetType = TargetTypes.POSITION) {
            return this.target;
        }
    }

    setTarget(target) {
        if (target instanceof GameObject) {
            if (target === undefined || target === null || !target.hasOwnProperty('_objid')) {
                throw new Error(`Target has no object ID: ${target}`);
            }
            this.target = target._objid;
            this.targetType = TargetTypes.GAMEOBJECT;
        } else if (target instanceof Sylvester.Vector) {
            this.target = target;
            this.targetType = TargetTypes.POSITION;
        } else {
            throw new Error("AI: unsupported target type: ", target);
        }
        const evt = new createjs.Event("ai_targetChanged", false, false);
        evt.data = { target, targetType: this.targetType };
        this.ship.dispatchEvent(evt);
    }

    clearTarget() {
        this.target = null;
    }
};

module.exports = AISubsystem;
