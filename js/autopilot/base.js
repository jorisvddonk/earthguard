const ShipSubsystem = require("../shipSubsystem");
const Sylvester = require("../sylvester-withmods.js");

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
        if (target === null) {
            return { target: null, targetpos: null };
        }

        if (target !== null) {
            if (target.hasOwnProperty("positionVec")) {
                return { target, targetpos: target.positionVec };
            } else if (
                target.hasOwnProperty("x") &&
                target.hasOwnProperty("y")
            ) {
                return {
                    target, targetpos: new Sylvester.Vector([
                        target.x,
                        target.y
                    ])
                };
            } else {
                return { target, targetpos: target };
            }
        }
    }
}

module.exports = BaseAutopilot;