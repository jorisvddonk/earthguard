const _ = require("lodash");
const Phonetics = require("./namegen");
const Planet = require("./planet");
const Jumpgate = require("./jumpgate");
const StarMetadata = require("../content/meta/stars.json");
const queue = require("./loadQueue");
const Sylvester = require("./sylvester-withmods.js");
var _last_id = 0;
var _gennedNames = [];
var genID = function() {
  //Used during constructor
  _last_id += 1;
  return _last_id;
};
var genStarClass = function() {
  //Used during constructor
  return StarMetadata.starClasses[
    _.random(0, StarMetadata.starClasses.length - 1)
  ];
};

var _genPlanets = function() {
  var nPlanets = parseInt(
    Math.random() *
      StarMetadata.starClassProperties[this.starclass].maxPlanets +
      1,
    10
  );
  nPlanets = Math.max(
    StarMetadata.starClassProperties[this.starclass].minPlanets,
    nPlanets
  );
  var retPlanets = [];
  for (var i = 0; i < nPlanets; i++) {
    retPlanets.push(
      new Planet({
        gfxID: "planet_test",
        index: i
      })
    );
  }
  return retPlanets;
};

var phonetics = new Phonetics();

var Star = function Star(options) {
  //super():
  createjs.Container.call(this);

  //
  var default_options = {
    name: phonetics.UGenerate("Svfvsv"),
    mapx: Math.random() * 100,
    mapy: Math.random() * 100,
    radius: 1 + Math.random() * 3,
    objid: genID(),
    starclass: genStarClass(),
    faction: -1,
    planets: [],
    jumpgates: []
  };
  options = _.extend({}, default_options, options);

  this.name = options.name;
  this.mapx = options.mapx;
  this.mapy = options.mapy;
  this.radius = options.radius;
  this.objid = options.objid;
  this.starclass = options.starclass;
  this.faction = options.faction;
  this.planets = options.planets;
  this.jumpgates = options.jumpgates;
  this._constructor_options = options;
  if (this.planets.length === 0) {
    this.planets = _genPlanets.bind(this)();
  }
  this.gfx = {
    bitmap: new createjs.Bitmap(
      queue.getResult(
        _.sample(StarMetadata.starClassGFXMappings[this.starclass])
      )
    )
  };
  this.addChild(this.gfx.bitmap);
  this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5;
  this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5;
};
Star.prototype = Object.create(createjs.Container.prototype);

Star.prototype.toString = function() {
  return this.name;
};
Star.prototype.tooltipString = function() {
  return this.name;
};

Star.prototype._genJumpgates = function _genJumpgates(otherstars) {
  function distfunc(x) {
    return (Math.sqrt(x) + 10) * 300;
  }
  this.jumpgates = _.map(
    otherstars,
    function(ostar) {
      var dist = distfunc(
        Math.sqrt(
          (ostar.mapx - this.mapx) * (ostar.mapx - this.mapx) +
            (ostar.mapy - this.mapy) * (ostar.mapy - this.mapy)
        )
      );
      let v = new Sylvester.Vector([1, 0]);
      var jg = new Jumpgate({
        linkedstar: ostar
        /*static_orbit: {
          distance: dist
          angle: v.angleTo(
            new Sylvester.Vector([
              ostar.mapx - this.mapx,
              ostar.mapy - this.mapy
            ])
          )
          // todo re-enable
      }*/
      });
      return jg;
    },
    this
  );
};

//Return the constructor function
module.exports = Star;
