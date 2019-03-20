import GameObject from '../gameObject'
import ShipSubsystem from '../shipSubsystem'
import { TargetType, createTarget } from '../targets'
import Sylvester from '../sylvester-withmods'

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

  public getTarget() {
    return this.ship.subsystems.ai
      ? this.ship.subsystems.ai.getTarget()
      : createTarget(TargetType.IDLE)
  }
}

export default BaseAutopilot
