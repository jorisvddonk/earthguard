const _ = require("lodash");
const FueltanksSubsystem = require("./subsystem/fueltanks");
const HullSubsystem = require("./subsystem/hull");
const EngineSubsystem = require("./subsystem/engine");
const SensorSubsystem = require("./subsystem/sensor");
const MemorySubsystem = require("./subsystem/memory");
const AISubsystem = require("./subsystem/ai");
const Sylvester = require("./sylvester-withmods.js");
const queue = require("./loadQueue");
const Mymath = require("./mymath.js");
const PIDController = require("./pidcontroller.js");
const Bullet = require("./bullet");
const gameState = require("./gameState");
const Stage = require("./stage");
const AutopilotV1 = require('./autopilot/v1')
const AutopilotV2 = require('./autopilot/v2')
const GameObject = require("./gameObject");
const factionRegistry = require("./factionRegistry");

const DEFAULT_OPTIONS = {
  gfxID: "ship",
  stats: {
    maxspeed: new Sylvester.Vector([5, 0]),
    bulletspeed: 10,
    bulletlifetime: 1000
  },
  name: "SomeShip",
  is_ai: true,
  faction: factionRegistry.get('Civilians')
};

class Ship extends GameObject {
  constructor(options) {
    if (typeof options.faction === 'string') {
      options.faction = factionRegistry.get(options.faction);
    }
    options = _.extend({}, DEFAULT_OPTIONS, options);
    super(options)

    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID)),
      graph: new createjs.Shape()
    };
    this.addChild(this.gfx.bitmap, this.gfx.graph);

    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5;
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5;

    this.name = options.name;
    this.faction = options.faction;

    this.stats = {
      maxspeed: options.stats.maxspeed,
      bulletspeed: options.stats.bulletspeed,
      bulletlifetime: options.stats.bulletlifetime
    };

    this.subsystems = {
      weapons: [],
      engine: new EngineSubsystem(this, {}),
      fueltanks: new FueltanksSubsystem(),
      radars: [],
      scanners: [],
      modifications: [],
      grippers: [],
      droids: [],
      shields: [],
      hull: new HullSubsystem(this, {}),
      cargobays: [],
      sensor: new SensorSubsystem(this, {}),
      memory: new MemorySubsystem(this, {}),
      autopilot: options.is_ai ? new AutopilotV2(this, {}) : null,
      ai: options.is_ai ? new AISubsystem(this, {}) : null
    };

    // debugging stuff when you control-click a ship:
    this.addEventListener('click', event => {
      if (event.nativeEvent.ctrlKey) {
        if (window.$S) {
          window.$S.alpha = 1;
        }
        window.$S = event.currentTarget;
        window.$St = event.target;
        window.$S.alpha = 0.5;
        miscDebug.debugship = this;
      }
    })
  }

  capMovement() {
    if (this.movementVec.modulus() > this.stats.maxspeed.modulus()) {
      this.movementVec = this.movementVec
        .toUnitVector()
        .multiply(this.stats.maxspeed.modulus());
    }
  };

  tick() {
    if (this.subsystems.hull.integrity <= 0) {
      this.destroy();
      return;
    }
    this.capMovement();
    if (this.subsystems.ai && this.subsystems.ai.tick) {
      this.subsystems.ai.tick();
    }
    if (this.subsystems.autopilot && this.subsystems.autopilot.tick) {
      this.subsystems.autopilot.tick();
    }
  };

  rotate(radians) {
    this.rotationVec = this.rotationVec
      .rotate(radians, new Sylvester.Vector([0, 0]))
      .toUnitVector();
  };

  thrust(multiply) {
    multiply = Mymath.clamp(multiply, this.subsystems.engine.canReverse ? -1 : 0, 1);
    this.movementVec = this.movementVec.add(
      this.subsystems.engine.thrustVector
        .rotate(
          this.subsystems.engine.thrustVector.angleTo(this.rotationVec),
          new Sylvester.Vector([0, 0])
        )
        .multiply(multiply)
    );
  };

  GFXTick() {
    this.gfx.graph.graphics.clear();
    this.gfx.graph.rotation = -this.rotation;
    const HULL_HEALTH_BAR_WIDTH = 80;
    const HULL_HEALTH_BAR_HEIGHT = 8;
    const HULL_HEALTH_BAR_STROKEWIDTH = 1;
    this.gfx.graph.graphics.beginFill("rgba(100,100,255)").drawRect(-40, -40, HULL_HEALTH_BAR_WIDTH, HULL_HEALTH_BAR_HEIGHT).endFill();
    this.gfx.graph.graphics.beginFill("rgba(100,255,100)").drawRect(-40 + HULL_HEALTH_BAR_STROKEWIDTH, -40 + HULL_HEALTH_BAR_STROKEWIDTH, Math.max(0, (this.subsystems.hull.integrity / this.subsystems.hull.maxIntegrity * HULL_HEALTH_BAR_WIDTH - (2 * HULL_HEALTH_BAR_STROKEWIDTH))), HULL_HEALTH_BAR_HEIGHT - (2 * HULL_HEALTH_BAR_STROKEWIDTH)).endFill();

    if (gameState.debugging.shiplines) {
      var stroke = "rgba(0,0,255,1)";
      if (this.subsystems.autopilot instanceof AutopilotV1) {
        stroke = "rgba(255,0,0,1)";
      }
      this.gfx.graph.graphics
        .beginStroke(stroke)
        .moveTo(0, 0)
        .lineTo(this.subsystems.autopilot.state.x_thrust, this.subsystems.autopilot.state.y_thrust)
        .endStroke();

      if (
        this.subsystems.ai.getTarget() !== null &&
        this.subsystems.ai.getTarget().hasOwnProperty("positionVec")
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
      var bullet = new Bullet({
        positionVec: this.positionVec,
        movementVec: this.movementVec
          .add(interception.toUnitVector().multiply(this.stats.bulletspeed))
          .rotate(Math.random() * 0.0523598776, new Sylvester.Vector([0, 0])),
        lifetime: this.stats.bulletlifetime
      });
      bullet.setOwner(this);
      let stage = Stage.get();
      stage.addChild(bullet);
    }
  };

  getFire() {
    if (this.subsystems.ai && this.subsystems.ai.getTarget()) {
      // fire at target
      var relPos = this.subsystems.ai.getTarget().positionVec.subtract(this.positionVec);
      var relVel = this.subsystems.ai.getTarget().movementVec.subtract(this.movementVec);
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
    } else {
      // fire straight ahead
      return this.rotationVec;
    }
  };
};

module.exports = Ship;
