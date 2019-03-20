import _ from 'lodash'
import Stage from './stage'
import Sylvester from './sylvester-withmods'
let nextObjectID = 0
import ObjectRegistry from './objectRegistry'

const DEFAULT_OPTIONS = {
  movementVec: new Sylvester.Vector([0, 0]), // Vector decribing current movement
  rotationVec: new Sylvester.Vector([1, 0]), // Vector describing current angle (rotation). Should be a unit vector.
  positionVec: new Sylvester.Vector([0, 0]), // Vector describing current position
}

const FORCE_CALCULATE = 'some_sentinel_value'

class GameObject extends createjs.Container {
  constructor(options) {
    options = _.extend({}, DEFAULT_OPTIONS, options)
    super()
    nextObjectID += 1
    this._objid = nextObjectID
    this.movementVec = options.movementVec
    this.rotationVec = options.rotationVec
    this.positionVec = options.positionVec
    this.static = options.static
    this.movementTick(FORCE_CALCULATE)
    ObjectRegistry.add(this)
  }

  public destroy() {
    ObjectRegistry.remove(this)
    const stage = Stage.get()
    stage.removeChild(this)
    this.dispatchEvent('destroyed')
    this.removeAllEventListeners()
  }

  public movementTick(event) {
    if (this.static && event !== FORCE_CALCULATE) {
      return
    }
    this.rotation =
      new Sylvester.Vector([1, 0]).angleTo(this.rotationVec) * 57.2957795 + 90
    this.positionVec = this.positionVec.add(this.movementVec)
    this.x = this.positionVec.e(1)
    this.y = this.positionVec.e(2)
  }
}

export default GameObject
