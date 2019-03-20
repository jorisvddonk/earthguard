import Sylvester from '../sylvester-withmods'
import Mymath from '../mymath'
import PIDController from '../pidcontroller'
import BaseAutopilot from './base'
import TargetTypes from '../subsystem/ai_targettypes'
import Ship from '../ship'

const OFFSET_ALLOWED = 0.0872664626 // 5 degrees
const OFFSET_ALLOWED_BACKWARDS = 0.436332313 // 25 degrees
export class AutopilotV2 extends BaseAutopilot {
  controllers: any
  state: any
  constructor(ship, options) {
    super(ship, options)
    this.controllers.posXPID = new PIDController(
      -0.45,
      -0.0,
      -80,
      -10,
      10,
      -10,
      10
    )
    this.controllers.posYPID = new PIDController(
      -0.45,
      -0.0,
      -80,
      -10,
      10,
      -10,
      10
    )
  }

  tick() {
    let { target, targetpos } = this.getTarget()
    const dispatchCompleteEvent = () => {
      const evt = new createjs.Event('autopilot_Complete', false, false)
      evt.data = { target: target, targetpos: targetpos }
      this.ship.dispatchEvent(evt)
    }

    if (target === TargetTypes.HALT) {
      // brake!
      // rotate towards movement vector's opposite
      let thrust_vec = this.ship.movementVec.rotate(
        Math.PI,
        new Sylvester.Vector([0, 0])
      )
      this.ship.rotate(thrust_vec)
      // thrust!
      let thrust_angle = this.ship.rotationVec.angleTo(thrust_vec)
      if (thrust_angle < OFFSET_ALLOWED && thrust_angle > -OFFSET_ALLOWED) {
        let act_thrust = Mymath.clampThrust(thrust_vec.modulus() * 500)
        this.state.lthrust = act_thrust
        this.ship.thrust(act_thrust)
      }

      // Check if we need to call callback
      if (this.ship.movementVec.modulus() < 0.05) {
        dispatchCompleteEvent()
      }
      return
    }

    if (target === null && targetpos === null) {
      return
    }

    /*
          Update PID controllers
          */

    //posXPID and posYPID
    var pos_vec_error = targetpos.subtract(this.ship.positionVec)
    var x_error = pos_vec_error.e(1)
    var y_error = pos_vec_error.e(2)
    this.controllers.posXPID.error = x_error
    this.controllers.posYPID.error = y_error
    var x_thrust = -this.controllers.posXPID.step()
    var y_thrust = -this.controllers.posYPID.step()

    /* 
          THRUSTING AND ROTATING
          */

    /* THRUSTING CONTROLS */
    var thrust_vec = new Sylvester.Vector([x_thrust, y_thrust])
    var sign = 1
    var thrust_angle = this.ship.rotationVec.angleTo(thrust_vec)

    // If we have a large thrust vector (large error):
    if (thrust_vec.modulus() > 0) {
      // Turn towards x_thrust/y_thrust
      if (!isNaN(thrust_angle)) {
        if (
          thrust_angle < Math.PI - OFFSET_ALLOWED_BACKWARDS &&
          thrust_angle > -Math.PI + OFFSET_ALLOWED_BACKWARDS
        ) {
          this.ship.rotate(thrust_angle)
        } else {
          sign = -1
          if (thrust_angle > 0) {
            thrust_angle = -(Math.PI - thrust_angle)
          } else if (thrust_angle < 0) {
            thrust_angle = -(-Math.PI + thrust_angle)
          }
          this.ship.rotate(thrust_angle)
        }
      }

      // Thrust if we're aligned correctly;
      if (thrust_angle < OFFSET_ALLOWED && thrust_angle > -OFFSET_ALLOWED) {
        var actual_thrust = Mymath.clampThrust(
          thrust_vec.modulus() * sign * 500
        )
        this.state.lthrust = actual_thrust
        this.ship.thrust(actual_thrust) //todo lower/max thrust?
      }
    } else {
      // If we have a small thrust vector, let's just point towards the enemy ship..
      // this.ship.rotate(rot); // ?? todo re-add?
    }

    // store state/data for gfx stuff
    this.state.x_thrust = x_thrust
    this.state.y_thrust = y_thrust

    // Check if we can fire
    if (target instanceof Ship) {
      this.ship.maybeFire()
    }

    // Check if we need to call callback
    if (
      pos_vec_error.modulus() < 50 &&
      this.ship.movementVec.modulus() < 0.75
    ) {
      dispatchCompleteEvent()
    }
  }
}
