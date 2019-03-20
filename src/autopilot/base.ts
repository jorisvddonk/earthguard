import Sylvester from '../sylvester-withmods'
const ShipSubsystem = require('../shipSubsystem').default
const GameObject = require('../gameObject').default
const TargetType = require('../subsystem/ai_targettypes').default

class BaseAutopilot extends ShipSubsystem {
  constructor(ship, options) {
    super(ship)
    this.subsystemType = 'autopilot'
    this.controllers = {}
    this.state = {}
    this.ship.addEventListener('ai_targetChanged', evt => {
      Object.values(this.controllers).forEach(controller => controller.reset())
    })
  }

  getTarget() {
    let target = this.ship.subsystems.ai
      ? this.ship.subsystems.ai.getTarget()
      : null
    if (target !== null) {
      if (target instanceof GameObject) {
        return { target, targetpos: target.positionVec }
      } else if (target instanceof Sylvester.Vector) {
        return { target, targetpos: target }
      } else if (target === TargetType.HALT) {
        return { target, targetpos: TargetType.HALT }
      }
    }
    return { target: null, targetpos: null }
  }
}

export default BaseAutopilot
