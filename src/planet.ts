import _ from 'lodash'
import GameObject from './gameObject'
import queue from './loadQueue'
import Sylvester from './sylvester-withmods'

const DEFAULT_OPTIONS = {
  gfxID: 'planet_test',
  static: true,
}

class Planet extends GameObject {
  constructor(options) {
    const orbit = {
      distance: Math.random() * 3000 + 1500,
      angle: Math.random() * 2 * Math.PI,
    }
    options = _.extend(
      {
        positionVec: new Sylvester.Vector([
          Math.cos(orbit.angle) * orbit.distance,
          Math.sin(orbit.angle) * orbit.distance,
        ]),
      },
      DEFAULT_OPTIONS,
      options
    )
    super(options)

    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID)),
    }
    this.addChild(this.gfx.bitmap)
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5
    this.name = options.name || 'SomePlanet'
  }

  public toString() {
    return this.name
  }
  public tooltipString() {
    return this.name
  }
}

export default Planet
