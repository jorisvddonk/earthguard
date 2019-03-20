import GameObject from './gameObject'
import queue from './loadQueue'
import Ship from './ship'

class Bullet extends GameObject {
  public gfx: any
  public stats: { aliveUntil: number }
  public owner: Ship

  constructor(options) {
    super(options)
    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult('bullet')),
      graph: new createjs.Shape(),
    }
    this.addChild(this.gfx.bitmap, this.gfx.graph)
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5

    this.stats = {
      aliveUntil: new Date().getTime() + options.lifetime,
    }
    this.owner = null
  }

  public setOwner(owner: Ship) {
    this.owner = owner
  }

  public tick(event) {
    if (event.timeStamp > this.stats.aliveUntil) {
      this.destroy()
      return
    }
  }
}

export default Bullet
