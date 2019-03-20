import _ from 'lodash'
import GameObject from '../gameObject'
import ObjectRegistry from '../objectRegistry'
import ShipSubsystem from '../shipSubsystem'
import Sylvester from '../sylvester-withmods'
import { TargetType, Target, createTarget } from '../targets'

class AISubsystem extends ShipSubsystem {
  public target: Target
  constructor(ship, options) {
    super(ship)
    this.subsystemType = 'ai'
    this.target = createTarget(TargetType.IDLE)
  }

  public tick() {
    if (
      ((this.target.type === TargetType.GAMEOBJECT ||
        this.target.type === TargetType.SHIP) &&
        !ObjectRegistry.has(this.target.tgt)) ||
      this.target.type === TargetType.LOST
    ) {
      console.log(this.ship._objid, 'Target lost', this.target)
      const evt = new createjs.Event('ai_targetLost', false, false)
      evt.data = { target: this.target }
      this.ship.dispatchEvent(evt)
      this.setTarget(createTarget(TargetType.LOST))
    }
  }

  public getTarget() {
    return this.target
  }

  public setTarget(target: Target) {
    if (!(target instanceof Target)) {
      throw new Error(`Target is no target! ${target}`)
    }
    this.target = target
    const evt = new createjs.Event('ai_targetChanged', false, false)
    evt.data = { target }
    this.ship.dispatchEvent(evt)
  }

  public clearTarget() {
    this.target = createTarget(TargetType.IDLE)
  }
}

export default AISubsystem
