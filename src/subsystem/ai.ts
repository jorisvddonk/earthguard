import _ from 'lodash'
import GameObject from '../gameObject'
import ObjectRegistry from '../objectRegistry'
import ShipSubsystem from '../shipSubsystem'
import Sylvester from '../sylvester-withmods'
import TargetTypes from './ai_targettypes'

class AISubsystem extends ShipSubsystem {
  constructor(ship, options) {
    super(ship)
    this.subsystemType = 'ai'
    this.target = null
    this.targetType = TargetTypes.NULL
    options = Object.assign({}, options)
  }

  public tick() {
    if (this.target !== null && this.targetType === TargetTypes.GAMEOBJECT) {
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
    if (this.targetType === TargetTypes.GAMEOBJECT) {
      return ObjectRegistry.get(this.target) || null
    } else if (
      this.targetType === TargetTypes.POSITION ||
      this.targetType === TargetTypes.NULL
    ) {
      return this.target
    } else if (this.targetType === TargetTypes.HALT) {
      return TargetTypes.HALT
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
      this.targetType = TargetTypes.GAMEOBJECT
    } else if (target instanceof Sylvester.Vector) {
      this.target = target
      this.targetType = TargetTypes.POSITION
    } else if (target === TargetTypes.HALT) {
      this.target = TargetTypes.HALT
      this.targetType = TargetTypes.HALT
    } else {
      throw new Error('AI: unsupported target type: ', target)
    }
    const evt = new createjs.Event('ai_targetChanged', false, false)
    evt.data = { target, targetType: this.targetType }
    this.ship.dispatchEvent(evt)
  }

  public clearTarget() {
    this.target = null
    this.targetType = TargetTypes.NULL
  }
}

export default AISubsystem
