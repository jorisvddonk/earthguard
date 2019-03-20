import _ from 'lodash'
import GameObject from '../gameObject'
import ObjectRegistry from '../objectRegistry'
import ShipSubsystem from '../shipSubsystem'
import Sylvester from '../sylvester-withmods'
import { TargetType } from './ai_targettypes'

class AISubsystem extends ShipSubsystem {
  public target: any
  public targetType: TargetType
  constructor(ship, options) {
    super(ship)
    this.subsystemType = 'ai'
    this.target = null
    this.targetType = TargetType.NULL
  }

  public tick() {
    if (this.target !== null && this.targetType === TargetType.GAMEOBJECT) {
      if (!ObjectRegistry.has(this.target)) {
        console.log(this.ship._objid, 'Target lost', this.target)
        const evt = new createjs.Event('ai_targetLost', false, false)
        evt.data = { target: this.target }
        this.ship.dispatchEvent(evt)
        this.clearTarget()
      }
    }
  }

  public getTarget() {
    if (this.targetType === TargetType.GAMEOBJECT) {
      return ObjectRegistry.get(this.target) || null
    } else if (
      this.targetType === TargetType.POSITION ||
      this.targetType === TargetType.NULL
    ) {
      return this.target
    } else if (this.targetType === TargetType.HALT) {
      return TargetType.HALT
    }
  }

  public setTarget(target) {
    if (target instanceof GameObject) {
      if (
        target === undefined ||
        target === null ||
        !target.hasOwnProperty('_objid')
      ) {
        throw new Error(`Target has no object ID: ${target}`)
      }
      this.target = target._objid
      this.targetType = TargetType.GAMEOBJECT
    } else if (target instanceof Sylvester.Vector) {
      this.target = target
      this.targetType = TargetType.POSITION
    } else if (target === TargetType.HALT) {
      this.target = TargetType.HALT
      this.targetType = TargetType.HALT
    } else {
      throw new Error(`AI: unsupported target type for ${target}`)
    }
    const evt = new createjs.Event('ai_targetChanged', false, false)
    evt.data = { target, targetType: this.targetType }
    this.ship.dispatchEvent(evt)
  }

  public clearTarget() {
    this.target = null
    this.targetType = TargetType.NULL
  }
}

export default AISubsystem
