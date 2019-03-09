const _ = require("lodash");
const FueltanksSubsystem = require("./subsystem/fueltanks");
const Sylvester = require("./sylvester-withmods.js");
const queue = require("./loadQueue");
const Mymath = require("./mymath.js");
const PIDController = require("./pidcontroller.js");
const Bullet = require("./bullet");
const gameState = require("./gameState");
const Stage = require("./stage");
const BrainV1 = require('./brains/v1')
const BrainV2 = require('./brains/v2')

class Ship extends createjs.Container {
  constructor(options, eventHub) {
    super()

    var default_options = {
      is_ai: true,
      x: Math.random() * 3000 - 1500,
      y: Math.random() * 3000 - 1500,
      gfxID: "ship",
      thrustVec: new Sylvester.Vector([0.04, 0]),
      stats: {
        maxspeed: new Sylvester.Vector([5, 0]),
        bulletspeed: 10,
        bulletlifetime: 1000
      },
      name: "SomeShip"
    };
    options = _.extend({}, default_options, options);

    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID)),
      graph: new createjs.Shape()
    };
    this.addChild(this.gfx.bitmap, this.gfx.graph);

    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5;
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5;

    this.thrustVec = options.thrustVec; // Vector describing the thrust capabilities. Second coordinate is ignored.
    this.movementVec = new Sylvester.Vector([0, 0]); // Vector decribing current movement
    this.rotationVec = new Sylvester.Vector([1, 0]); // Vector describing current angle (rotation). Should be a unit vector.
    this.positionVec = new Sylvester.Vector([options.x, options.y]);

    this.name = options.name;

    this.stats = {
      maxspeed: options.stats.maxspeed,
      bulletspeed: options.stats.bulletspeed,
      bulletlifetime: options.stats.bulletlifetime
    };

    this.subsystems = {
      weapons: [],
      engines: [],
      fueltanks: new FueltanksSubsystem(),
      radars: [],
      scanners: [],
      modifications: [],
      grippers: [],
      droids: [],
      shields: [],
      armors: [],
      cargobays: []
    };

    this.ai = new BrainV2(this);

    eventHub.addEventListener("movementTick", this.movementTick.bind(this));
    eventHub.addEventListener("GFXTick", this.GFXTick.bind(this));
    if (options.is_ai) {
      eventHub.addEventListener("AITick", this.AITick.bind(this));
    }
  }

  capMovement() {
    if (this.movementVec.modulus() > this.stats.maxspeed.modulus()) {
      this.movementVec = this.movementVec
        .toUnitVector()
        .multiply(this.stats.maxspeed.modulus());
    }
  };

  movementTick() {
    this.capMovement();
    this.rotation =
      new Sylvester.Vector([1, 0]).angleTo(this.rotationVec) * 57.2957795 + 90;
    this.positionVec = this.positionVec.add(this.movementVec);
    this.x = this.positionVec.e(1);
    this.y = this.positionVec.e(2);
  };

  AITick() {
    this.ai.AITick();
  };

  rotate(radians) {
    this.rotationVec = this.rotationVec
      .rotate(radians, new Sylvester.Vector([0, 0]))
      .toUnitVector();
  };

  thrust(multiply) {
    multiply = Mymath.clamp(multiply, -1, 1);
    this.movementVec = this.movementVec.add(
      this.thrustVec
        .rotate(
          this.thrustVec.angleTo(this.rotationVec),
          new Sylvester.Vector([0, 0])
        )
        .multiply(multiply)
    );
  };

  GFXTick() {
    this.gfx.graph.graphics.clear();
    this.gfx.graph.rotation = -this.rotation;

    if (gameState.debugging.shiplines) {
      var stroke = "rgba(0,0,255,1)";
      if (this.ai.brain == "v1") {
        stroke = "rgba(255,0,0,1)";
      }
      this.gfx.graph.graphics
        .beginStroke(stroke)
        .moveTo(0, 0)
        .lineTo(this.ai.state.x_thrust, this.ai.state.y_thrust)
        .endStroke();

      if (
        this.ai.target !== null &&
        this.ai.target.hasOwnProperty("positionVec")
      ) {
        var interception = this.getFire();
        if (interception !== null) {
          this.gfx.graph.graphics
            .beginStroke("rgba(0,255,0,1)")
            .moveTo(0, 0)
            .lineTo(interception.e(1), interception.e(2))
            .endStroke();
        }
      }
    }
  };

  maybeFire() {
    var interception = this.getFire();
    if (interception != null) {
      // determine if our bullets would live long enough to actually make it to the interception point
      if (
        (interception.modulus() / this.stats.bulletspeed) * (1000 / 60) <
        this.stats.bulletlifetime
      ) {
        // TODO: remove constant (1000/60 = ms per frame assuming 60fps)
        // Fire! (and use the precomputed interception point to prevent having to recompute again)
        this.fire(interception);
      }
    }
  };

  fire(interception) {
    if (interception === null || interception === undefined) {
      var interception = this.getFire();
    }
    if (interception !== null) {
      var bullet = new Bullet(
        this.positionVec,
        this.movementVec
          .add(interception.toUnitVector().multiply(this.stats.bulletspeed))
          .rotate(Math.random() * 0.0523598776, new Sylvester.Vector([0, 0])),
        this.stats.bulletlifetime
      );
      gameState.bullets.push(bullet);
      let stage = Stage.get();
      stage.addChild(bullet);
    }
  };

  getFire() {
    var interception = Mymath.intercept(
      this.positionVec,
      this.stats.bulletspeed,
      this.ai.target.positionVec,
      this.ai.target.movementVec
    );
    var relPos = this.ai.target.positionVec.subtract(this.positionVec);
    var relVel = this.ai.target.movementVec.subtract(this.movementVec);
    var interception2 = Mymath.intercept2(
      {
        x: 0,
        y: 0
      },
      {
        x: relPos.e(1),
        y: relPos.e(2),
        vx: relVel.e(1),
        vy: relVel.e(2)
      },
      this.stats.bulletspeed
    );
    return interception2;
  };
};

module.exports = Ship;
