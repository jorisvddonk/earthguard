const PIDController = require('../pidcontroller');
const Sylvester = require("../sylvester-withmods.js");

class BrainV1 extends Object {
    constructor(ship) {
        super()
        this.ship = ship;
        this.target = null
        this.targetpos = null
        this.targetcallback = null
        this.controllers = {
            rotPID: new PIDController(-0.9, -0.9, -10),
            movPID: new PIDController(-0.1, -0.1, -40, -1, 1),
            posXPID: new PIDController(-0.45, -0.0, -80, -10, 10, -10, 10),
            posYPID: new PIDController(-0.45, -0.0, -80, -10, 10, -10, 10)
        };
        this.state = {}
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

        //movPID: Set origin to ship's x/y, determine vector between ship and ship.ai.target, rotate everything so that ship points to the right ([1,0]) (rotated vector between ship and ship)'s x-coordinate is the error (OR IS IT THE DISTANCE OF THE VECTOR??? maybe not. probably not.)
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

        //posXPID and posYPID
        var pos_vec_error = this.targetpos.subtract(this.ship.positionVec);
        var x_error = pos_vec_error.e(1);
        var y_error = pos_vec_error.e(2);
        this.controllers.posXPID.error = x_error;
        this.controllers.posYPID.error = y_error;
        var x_thrust = -this.controllers.posXPID.step();
        var y_thrust = -this.controllers.posYPID.step();

        /* 
          THRUSTING AND ROTATING
          */

        /* THRUSTING CONTROLS */
        this.ship.rotate(rot);
        this.ship.thrust(thrust);

        /* Prevent unused controllers from going wild */
        this.controllers.posXPID.integralError = 0;
        this.controllers.posYPID.integralError = 0;

        // store state/data for gfx stuff
        this.state.x_thrust = x_thrust;
        this.state.y_thrust = y_thrust;

        // Check if we can fire
        const Ship = require("../ship"); // for some reason, if this is put at the top of the file, it won't work. Weird.
        if (this.target instanceof Ship) {
            this.ship.maybeFire();
        }

        // Check if we need to call callback
        if (this.targetcallback !== null) {
            if (pos_vec_error.modulus() < 50 && this.ship.movementVec.modulus() < 0.75) {
                this.targetcallback();
            }
        }
    }
}

module.exports = BrainV1