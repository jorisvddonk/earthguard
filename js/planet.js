const _ = require("lodash");
const queue = require("./loadQueue");

class Planet extends createjs.Container {
  /*
      options: {
        gfxID: "planet_foo",
      }
    */
  constructor(options) {
    super()
    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID))
    };
    this.addChild(this.gfx.bitmap);
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5;
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5;
  
    _.extend(this, options);
  
    this.orbit = {
      distance: Math.random() * 3000 + 1500,
      angle: Math.random() * 2 * Math.PI
    };
  
    this.calcPosition();
  };

  toString() {
    return "Planet[" + this.index + "]";
  };
  tooltipString() {
    return "Planet[" + this.index + "]";
  };
  
  calcPosition() {
    this.x = Math.cos(this.orbit.angle) * this.orbit.distance;
    this.y = Math.sin(this.orbit.angle) * this.orbit.distance;
  };
};

module.exports = Planet;
