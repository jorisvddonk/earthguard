const PIDController = require('../pidcontroller');
const Sylvester = require("../sylvester-withmods.js");
const ShipSubsystem = require("../shipSubsystem")

class AutopilotV1 extends ShipSubsystem {
    constructor(ship, options) {
        super(ship)
        this.target = null
        this.targetpos = null
        this.controllers = {
            rotPID: new PIDController(-0.9, -0.9, -10),
            movPID: new PIDController(-0.1, -0.1, -40, -1, 1)
        };
        this.state = {} // not really used
    }

    AITick() {
        if (this.target === null) {
            return;
        }

        if (this.target !== null) {
            if (this.target.hasOwnProperty("positionVec")) {
                this.targetpos = this.target.positionVec;
            } else if (
                this.target.hasOwnProperty("x") &&
                this.target.hasOwnProperty("y")
            ) {
                this.targetpos = new Sylvester.Vector([
                    this.target.x,
                    this.target.y
                ]);
            } else {
                this.targetpos = this.target;
            }
        }

        /*
          Update PID controllers
          */

        //rotPID
        var angle_error = this.ship.rotationVec.angleTo(
            this.targetpos.subtract(this.ship.positionVec)
        );
        this.controllers.rotPID.error = angle_error;
        var ship_rot = this.controllers.rotPID.step();
        var rot = Mymath.clampRot(-(ship_rot * 0.1));

        //movPID: Set origin to ship's x/y, determine vector between ship and target, rotate everything so that ship points to the right ([1,0]) (rotated vector between ship and ship)'s x-coordinate is the error (OR IS IT THE DISTANCE OF THE VECTOR??? maybe not. probably not.)
        var pos_error = this.targetpos
            .subtract(this.ship.positionVec)
            .rotate(
                -new Sylvester.Vector([1, 0]).angleTo(this.ship.rotationVec),
                new Sylvester.Vector([0, 0])
            )
            .e(1);
        this.controllers.movPID.error = pos_error;
        var thrust = Mymath.clampThrust(
            Math.pow(-this.controllers.movPID.step() * 0.1 * 5, 3) * 0.1
        );

        /* 
          THRUSTING AND ROTATING
          */

        /* THRUSTING CONTROLS */
        this.ship.rotate(rot);
        this.ship.thrust(thrust);

        // Check if we can fire
        const Ship = require("../ship"); // for some reason, if this is put at the top of the file, it won't work. Weird.
        if (this.target instanceof Ship) {
            this.ship.maybeFire();
        }
    }
}

module.exports = AutopilotV1