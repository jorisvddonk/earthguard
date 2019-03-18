const ShipSubsystem = require("../shipSubsystem");
const Sylvester = require("../sylvester-withmods.js");
const GameObject = require("../gameObject");

class BaseAutopilot extends ShipSubsystem {
    constructor(ship, options) {
        super(ship);
        this.subsystemType = "autopilot";
        this.controllers = {};
        this.state = {};
        this.ship.addEventListener('ai_targetChanged', (evt) => {
            Object.values(this.controllers).forEach(controller => controller.reset());
        });
    }

    getTarget() {
        let target = this.ship.subsystems.ai ? this.ship.subsystems.ai.getTarget() : null;
        if (target !== null) {
            if (target instanceof GameObject) {
                return { target, targetpos: target.positionVec };
            } else if (target instanceof Sylvester.Vector) {
                return { target, targetpos: target };
            }
        }
        return { target: null, targetpos: null }
    }
}

module.exports = BaseAutopilot;