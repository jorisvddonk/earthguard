import _ from 'lodash'
import queue from './loadQueue'
class Jumpgate extends createjs.Container {
  private gfx: { bitmap: createjs.Bitmap }
  private static_orbit: { distance?: number; angle?: number }
  private linkedstar: any
  /*
      options: {
        static_orbit: {
          distance: 123,
          angle: 0.12
        }
        linkedstar: <star>
      }
  */
  constructor(options: {
    static_orbit?: { distance?: number; angle?: number }
    linkedstar?: any
    gfxID: string
  }) {
    super()
    const DEFAULT_OPTIONS = {
      gfxID: 'jumppoint',
      static_orbit: {
        distance: 500,
        angle: Math.random() * 2 * Math.PI,
      },
      linkedstar: null,
    }
    options = _.extend({}, DEFAULT_OPTIONS, options)

    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID)),
    }
    this.addChild(this.gfx.bitmap)
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5

    this.static_orbit = options.static_orbit
    this.linkedstar = options.linkedstar
    this.calcPosition()
  }

  public toString() {
    return 'Jumpgate[to ' + this.linkedstar.name + ']'
  }
  public tooltipString() {
    return 'Jumpgate to ' + this.linkedstar.name
  }

  public calcPosition() {
    this.x = Math.cos(this.static_orbit.angle) * this.static_orbit.distance
    this.y = Math.sin(this.static_orbit.angle) * this.static_orbit.distance
  }
}

export default Jumpgate
