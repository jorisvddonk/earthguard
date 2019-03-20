const queue = require("./loadQueue");
const Stage = require("./stage");
const GameObject = require("./gameObject");

class Bullet extends GameObject {
  constructor(options) {
    super(options);
    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult("bullet")),
      graph: new createjs.Shape()
    };
    this.addChild(this.gfx.bitmap, this.gfx.graph);
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5;
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5;

    this.stats = {
      aliveUntil: new Date().getTime() + options.lifetime
    };
    this.owner = null;
  }

  setOwner(owner) {
    this.owner = owner;
  }

  tick(event) {
    if (event.timeStamp > this.stats.aliveUntil) {
      this.destroy();
      return;
    }
  }
}

export default Bullet;
