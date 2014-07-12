define('jumpgate', [], function(){
  var Jumpgate = function Jumpgate(options){
    /*
      options: {
        static_orbit: {
          distance: 123,
          angle: 0.12
        }
        linkedstar: <star>
      }
    */
    //super():
    createjs.Container.call(this);


    //
    var default_options = {
      "gfxID": "jumppoint",
      "static_orbit": {
        "distance": 3000,
        "angle": Math.random() * 2 * Math.PI
      },
      "linkedstar": null
    };
    options = _.extend({}, default_options, options);

    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID))
    };
    this.addChild(this.gfx.bitmap);
    this.gfx.bitmap.regX = this.gfx.bitmap.image.width*0.5;
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height*0.5;

    _.extend(this, options);
    this.calcPosition();
  };
  Jumpgate.prototype = Object.create(createjs.Container.prototype);

  Jumpgate.prototype.toString = function(){
    return "Jumpgate[to " + this.linkedstar.name + "]";
  };

  Jumpgate.prototype.calcPosition = function() {
    this.x = Math.cos(this.static_orbit.angle) * this.static_orbit.distance;
    this.y = Math.sin(this.static_orbit.angle) * this.static_orbit.distance;
  };

  return Jumpgate;
});