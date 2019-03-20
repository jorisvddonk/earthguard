import Mymath from '../mymath'
import PIDController from '../pidcontroller'
import Ship from '../ship'
import Sylvester from '../sylvester-withmods'
import BaseAutopilot from './base'

class AutopilotV1 extends BaseAutopilot {
  public controllers: any
  constructor(ship, options) {
    super(ship, options)
    this.controllers.rotPID = new PIDController(-0.9, -0.9, -10)
    this.controllers.movPID = new PIDController(-0.1, -0.1, -40, -1, 1)
  }

  public tick() {
    const { target, targetpos } = this.getTarget()
    if (targetpos === null) {
      return
    }

    /*
          Update PID controllers
          */

    // rotPID
    const angle_error = this.ship.rotationVec.angleTo(
      targetpos.subtract(this.ship.positionVec)
    )
    this.controllers.rotPID.error = angle_error
    const ship_rot = this.controllers.rotPID.step()
    const rot = Mymath.clampRot(-(ship_rot * 0.1))

    // movPID: Set origin to ship's x/y, determine vector between ship and target, rotate everything so that ship points to the right ([1,0]) (rotated vector between ship and ship)'s x-coordinate is the error (OR IS IT THE DISTANCE OF THE VECTOR??? maybe not. probably not.)
    const pos_error = targetpos
      .subtract(this.ship.positionVec)
      .rotate(
        -new Sylvester.Vector([1, 0]).angleTo(this.ship.rotationVec),
        new Sylvester.Vector([0, 0])
      )
      .e(1)
    this.controllers.movPID.error = pos_error
    const thrust = Mymath.clampThrust(
      Math.pow(-this.controllers.movPID.step() * 0.1 * 5, 3) * 0.1
    )

    /* 
          THRUSTING AND ROTATING
          */

    /* THRUSTING CONTROLS */
    this.ship.rotate(rot)
    this.ship.thrust(thrust)

    // Check if we can fire
    if (target instanceof Ship) {
      this.ship.maybeFire()
    }
  }
}

export default AutopilotV1
