import _ from 'lodash'
import { AutopilotV2 } from './autopilot/v2'
import Bullet from './bullet'
import factionRegistry from './factionRegistry'
import GameObject from './gameObject'
import gameState from './gameState'
import queue from './loadQueue'
import Mymath from './mymath'
import NotificationSystem, { NotificationType } from './notificationSystem'
import PIDController from './pidcontroller'
import Stage from './stage'
import AISubsystem from './subsystem/ai'
import EngineSubsystem from './subsystem/engine'
import FueltanksSubsystem from './subsystem/fueltanks'
import HullSubsystem from './subsystem/hull'
import MemorySubsystem from './subsystem/memory'
import SensorSubsystem from './subsystem/sensor'
import Sylvester from './sylvester-withmods'

const DEFAULT_OPTIONS = {
  gfxID: 'ship',
  stats: {
    maxspeed: new Sylvester.Vector([5, 0]),
    bulletspeed: 10,
    bulletlifetime: 1000,
  },
  name: 'SomeShip',
  is_ai: true,
  faction: factionRegistry.get('Civilians'),
}

class Ship extends GameObject {
  public stats: { maxspeed: any; bulletspeed: any; bulletlifetime: any }
  public faction: any
  public name: any
  public gfx: any
  public subsystems: {
    weapons: any[]
    engine: EngineSubsystem
    fueltanks: FueltanksSubsystem
    radars: any[]
    scanners: any[]
    modifications: any[]
    grippers: any[]
    droids: any[]
    shields: any[]
    hull: HullSubsystem
    cargobays: any[]
    sensor: SensorSubsystem
    memory: MemorySubsystem
    autopilot: AutopilotV2
    ai: AISubsystem
  }
  constructor(options) {
    if (typeof options.faction === 'string') {
      options.faction = factionRegistry.get(options.faction)
    }
    options = _.extend({}, DEFAULT_OPTIONS, options)
    super(options)

    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID)),
      graph: new createjs.Shape(),
    }
    this.addChild(this.gfx.bitmap, this.gfx.graph)

    this.gfx.bitmap.regX = this.gfx.bitmap.image.width * 0.5
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height * 0.5

    this.name = options.name
    this.faction = options.faction

    this.stats = {
      maxspeed: options.stats.maxspeed,
      bulletspeed: options.stats.bulletspeed,
      bulletlifetime: options.stats.bulletlifetime,
    }

    this.subsystems = {
      weapons: [],
      engine: new EngineSubsystem(this, {}),
      fueltanks: new FueltanksSubsystem(this, {}),
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
      ai: options.is_ai ? new AISubsystem(this, {}) : null,
    }

    // debugging stuff when you control-click a ship:
    this.addEventListener('click', (event: any) => {
      if (event.nativeEvent.ctrlKey) {
        if (window.$S) {
          window.$S.alpha = 1
        }
        window.$S = event.currentTarget
        window.$St = event.target
        window.$S.alpha = 0.5
        miscDebug.debugship = this
      } else {
        gameState.player.selectedShip = this
      }
    })

    this.addEventListener('destroyed', () => {
      NotificationSystem.get().push({
        type: NotificationType.SHIP_DESTROYED,
        message: 'Ship ' + this._objid + ' has been destroyed!',
      })
    })
  }

  public tick() {
    if (this.subsystems.hull.integrity <= 0) {
      this.destroy()
      return
    }
    this.capMovement()
    if (this.subsystems.ai && this.subsystems.ai.tick) {
      this.subsystems.ai.tick()
    }
    if (this.subsystems.autopilot && this.subsystems.autopilot.tick) {
      this.subsystems.autopilot.tick()
    }
  }

  public rotate(amount: number | Sylvester.Vector) {
    // amount is a local-vector pointing towards an angle to rate to
    // or a rotation to point to specified in radians
    if (amount instanceof Sylvester.Vector) {
      amount = this.rotationVec.angleTo(amount)
    }
    this.rotationVec = this.rotationVec
      .rotate(Mymath.clampRot(amount), new Sylvester.Vector([0, 0]))
      .toUnitVector()
  }

  public thrust(multiply: number) {
    multiply = Mymath.clamp(
      multiply,
      this.subsystems.engine.canReverse ? -1 : 0,
      1
    )
    this.movementVec = this.movementVec.add(
      this.subsystems.engine.thrustVector
        .rotate(
          this.subsystems.engine.thrustVector.angleTo(this.rotationVec),
          new Sylvester.Vector([0, 0])
        )
        .multiply(multiply)
    )
  }

  public GFXTick() {
    this.gfx.graph.graphics.clear()
    this.gfx.graph.rotation = -this.rotation
    const HULL_HEALTH_BAR_WIDTH = 80
    const HULL_HEALTH_BAR_HEIGHT = 8
    const HULL_HEALTH_BAR_STROKEWIDTH = 1
    this.gfx.graph.graphics
      .beginFill('rgba(100,100,255)')
      .drawRect(-40, -40, HULL_HEALTH_BAR_WIDTH, HULL_HEALTH_BAR_HEIGHT)
      .endFill()
    this.gfx.graph.graphics
      .beginFill('rgba(100,255,100)')
      .drawRect(
        -40 + HULL_HEALTH_BAR_STROKEWIDTH,
        -40 + HULL_HEALTH_BAR_STROKEWIDTH,
        Math.max(
          0,
          (this.subsystems.hull.integrity / this.subsystems.hull.maxIntegrity) *
            HULL_HEALTH_BAR_WIDTH -
            2 * HULL_HEALTH_BAR_STROKEWIDTH
        ),
        HULL_HEALTH_BAR_HEIGHT - 2 * HULL_HEALTH_BAR_STROKEWIDTH
      )
      .endFill()

    if (gameState.debugging.shiplines) {
      let stroke = 'rgba(0,0,255,1)'
      if (this.subsystems.autopilot) {
        this.gfx.graph.graphics
          .beginStroke(stroke)
          .moveTo(0, 0)
          .lineTo(
            this.subsystems.autopilot.state.x_thrust,
            this.subsystems.autopilot.state.y_thrust
          )
          .endStroke()
      }

      if (
        this.subsystems.ai &&
        this.subsystems.ai.getTarget() !== null &&
        this.subsystems.ai.getTarget().hasOwnProperty('positionVec')
      ) {
        const interception = this.getFire()
        if (interception !== null) {
          this.gfx.graph.graphics
            .beginStroke('rgba(0,255,0,1)')
            .moveTo(0, 0)
            .lineTo(interception.e(1), interception.e(2))
            .endStroke()
        }
      }
    }
  }

  public maybeFire() {
    const interception = this.getFire()
    if (interception != null) {
      // determine if our bullets would live long enough to actually make it to the interception point
      if (
        (interception.modulus() / this.stats.bulletspeed) * (1000 / 60) <
        this.stats.bulletlifetime
      ) {
        // TODO: remove constant (1000/60 = ms per frame assuming 60fps)
        // Fire! (and use the precomputed interception point to prevent having to recompute again)
        this.fire(interception)
      }
    }
  }

  public fire(interception: Sylvester.Vector) {
    if (interception === null || interception === undefined) {
      interception = this.getFire()
    }
    if (interception !== null) {
      const bullet = new Bullet({
        positionVec: this.positionVec,
        movementVec: this.movementVec
          .add(interception.toUnitVector().multiply(this.stats.bulletspeed))
          .rotate(Math.random() * 0.0523598776, new Sylvester.Vector([0, 0])),
        lifetime: this.stats.bulletlifetime,
      })
      bullet.setOwner(this)
      const stage = Stage.get()
      stage.addChild(bullet)
    }
  }

  public getFire(): Sylvester.Vector {
    if (this.subsystems.ai && this.subsystems.ai.getTarget()) {
      // fire at target
      const obj = this.subsystems.ai.getTarget().getGameObject()
      const relPos = obj.positionVec.subtract(this.positionVec)
      const relVel = obj.movementVec.subtract(this.movementVec)
      const interception2: Sylvester.Vector = Mymath.intercept2(
        {
          x: 0,
          y: 0,
        },
        {
          x: relPos.e(1),
          y: relPos.e(2),
          vx: relVel.e(1),
          vy: relVel.e(2),
        },
        this.stats.bulletspeed
      )
      return interception2
    } else {
      // fire straight ahead
      return this.rotationVec
    }
  }

  private capMovement() {
    if (this.movementVec.modulus() > this.stats.maxspeed.modulus()) {
      this.movementVec = this.movementVec
        .toUnitVector()
        .multiply(this.stats.maxspeed.modulus())
    }
  }
}

export default Ship
