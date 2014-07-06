define('planet', [], function(){
  var Planet = function Planet(options){
    /*
      options: {
        gfxID: "planet_foo",
      }
    */
    //super():
    createjs.Container.call(this);

    //
    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID))
    };
    this.addChild(this.gfx.bitmap);
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width*0.5;
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height*0.5;

    _.extend(this, options);


    this.orbit = {
      "distance": Math.random() * 3000 + 1500,
      "angle": Math.random() * 2 * Math.PI
    };

    this.calcPosition();
  };
  Planet.prototype = Object.create(createjs.Container.prototype);

  Planet.prototype.toString = function(){
    return "Planet[" + this.index + "]";
  }

  Planet.prototype.calcPosition = function() {
    this.x = Math.cos(this.orbit.angle) * this.orbit.distance;
    this.y = Math.sin(this.orbit.angle) * this.orbit.distance;
  };

  return Planet;
});