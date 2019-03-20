import _ from 'lodash'
import queue from './loadQueue'
class Jumpgate extends createjs.Container {
  /*
      options: {
        static_orbit: {
          distance: 123,
          angle: 0.12
        }
        linkedstar: <star>
      }
  */
  constructor(options) {
    super()
    let default_options = {
      gfxID: 'jumppoint',
      static_orbit: {
        distance: 500,
        angle: Math.random() * 2 * Math.PI,
      },
      linkedstar: null,
    }
    options = _.extend({}, default_options, options)

    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID)),
    }
    this.addChild(this.gfx.bitmap)
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5

    this.static_orbit = options.static_orbit
    this.linkedstar = options.linkedstar
    this.gfxID = options.gfxID
    this.calcPosition()
  }

  toString() {
    return 'Jumpgate[to ' + this.linkedstar.name + ']'
  }
  tooltipString() {
    return 'Jumpgate to ' + this.linkedstar.name
  }

  calcPosition() {
    this.x = Math.cos(this.static_orbit.angle) * this.static_orbit.distance
    this.y = Math.sin(this.static_orbit.angle) * this.static_orbit.distance
  }
}

export default Jumpgate
