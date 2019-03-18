const queue = require("./loadQueue");
const Stage = require("./stage");
const GameObject = require("./gameObject");

class Bullet extends GameObject {
  constructor(position, velocity, lifetime, owner) {
    super();

    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult("bullet")),
      graph: new createjs.Shape()
    };
    this.addChild(this.gfx.bitmap, this.gfx.graph);
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5;
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5;

    this.movementVec = velocity;
    this.positionVec = position;

    this.stats = {
      aliveUntil: new Date().getTime() + lifetime
    };
    this.owner = owner;
  }

  movementTick(event) {
    let stage = Stage.get();
    if (event.timeStamp > this.stats.aliveUntil) {
      this.destroy();
      return;
    }
    this.positionVec = this.positionVec.add(this.movementVec);
    this.x = this.positionVec.e(1);
    this.y = this.positionVec.e(2);
  };
}

module.exports = Bullet;
