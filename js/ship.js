define('ship', ["shipSubsystem", "subsystem/fueltanks"], function(ShipSubsystem, FueltanksSubsystem){
  var Ship = function Ship(options){
    //super():
    createjs.Container.call(this);
    //

    var default_options = {
      "is_ai": true,
      "x": Math.random()*3000 - 1500,
      "y": Math.random()*3000 - 1500,
      "gfxID": 'ship',
      "thrustVec": $V([0.04,0]),
      "stats": {
        "maxspeed": $V([5,0]),
        "bulletspeed": 10
      }
    };
    options = _.extend({}, default_options, options);


    this.gfx = {
      bitmap: new createjs.Bitmap(queue.getResult(options.gfxID)),
      graph: new createjs.Shape()
    };
    this.addChild(this.gfx.bitmap, this.gfx.graph);

    this.gfx.bitmap.regX = this.gfx.bitmap.image.width*0.5;
    this.gfx.bitmap.regY = this.gfx.bitmap.image.height*0.5;

    this.thrustVec = options.thrustVec; // Vector describing the thrust capabilities. Second coordinate is ignored.
    this.movementVec = $V([0,0]); // Vector decribing current movement
    this.rotationVec = $V([1,0]); // Vector describing current angle (rotation). Should be a unit vector.
    this.positionVec = $V([options.x,options.y]);

    this.stats = {
      maxspeed: options.stats.maxspeed,
      bulletspeed: options.stats.bulletspeed
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

    this.ai = {
      brain: "v2",
      target: null,
      targetpos: null,
      targetcallback: null,
      controllers: {
        rotPID: new PIDController(-0.9,-0.9,-10),
        movPID: new PIDController(-0.1,-0.1,-40, -1, 1),
        posXPID: new PIDController(-0.45,-0.00,-80, -10, 10, -10, 10),
        posYPID: new PIDController(-0.45,-0.00,-80, -10, 10, -10, 10)
      },
      state: {}
    };

    eventHub.addEventListener("movementTick", this.movementTick.bind(this));
    eventHub.addEventListener("GFXTick", this.GFXTick.bind(this));
    if (options.is_ai) {
      eventHub.addEventListener("AITick", this.AITick.bind(this));
    }
  };
  Ship.prototype = Object.create(createjs.Container.prototype);


  Ship.prototype.capMovement = function() {
    if (this.movementVec.modulus() > this.stats.maxspeed.modulus()) {
      this.movementVec = this.movementVec.toUnitVector().multiply(this.stats.maxspeed.modulus());
    }
  };

  Ship.prototype.movementTick = function() {
    this.capMovement();
    this.rotation = ($V([1,0]).angleTo(this.rotationVec) * 57.2957795) + 90;
    this.positionVec = this.positionVec.add(this.movementVec);
    this.x = this.positionVec.e(1);
    this.y = this.positionVec.e(2);
  };

  Ship.prototype.AITick = function() {
    if (this.ai.target === null) {
      return;
    }

    if (this.ai.target !== null) {
      if (this.ai.target.hasOwnProperty("positionVec")) {
        this.ai.targetpos = this.ai.target.positionVec;
      } else if (this.ai.target.hasOwnProperty("x") && this.ai.target.hasOwnProperty("y")) {
        this.ai.targetpos = $V([this.ai.target.x, this.ai.target.y]);
      } else {
        this.ai.targetpos = this.ai.target;
      }
    }


    /*
    Update PID controllers
    */

    //rotPID
    var angle_error = this.rotationVec.angleTo(this.ai.targetpos.subtract(this.positionVec));
    this.ai.controllers.rotPID.error = angle_error;
    var ship_rot = this.ai.controllers.rotPID.step();
    var rot = Mymath.clampRot(-(ship_rot * 0.1));
    
    //movPID: Set origin to ship's x/y, determine vector between ship and ship.ai.target, rotate everything so that ship points to the right ([1,0]) (rotated vector between ship and ship)'s x-coordinate is the error (OR IS IT THE DISTANCE OF THE VECTOR??? maybe not. probably not.)
    var pos_error = this.ai.targetpos.subtract(this.positionVec).rotate(-$V([1,0]).angleTo(this.rotationVec), $V([0,0])).e(1);
    this.ai.controllers.movPID.error = pos_error;
    var thrust = Mymath.clampThrust(Math.pow(-this.ai.controllers.movPID.step()*0.1*5,3)*0.1);
    
    //posXPID and posYPID
    var pos_vec_error = this.ai.targetpos.subtract(this.positionVec);
    var x_error = pos_vec_error.e(1);
    var y_error = pos_vec_error.e(2);
    this.ai.controllers.posXPID.error = x_error;
    this.ai.controllers.posYPID.error = y_error;
    var x_thrust = -this.ai.controllers.posXPID.step();
    var y_thrust = -this.ai.controllers.posYPID.step();

    /* 
    THRUSTING AND ROTATING
    */

    /* THRUSTING CONTROLS */
    if (this.ai.brain == "v1") {
      this.rotate(rot);
      this.thrust(thrust);
    } else if (this.ai.brain == "v2") {
      var thrust_vec = $V([x_thrust, y_thrust]);
      var sign = 1;
      var thrust_angle = this.rotationVec.angleTo(thrust_vec);
      var OFFSET_ALLOWED = 0.0872664626; // 5 degrees
      var OFFSET_ALLOWED_BACKWARDS = 0.436332313; // 25 degrees

      // If we have a large thrust vector (large error):
      if (thrust_vec.modulus() > 0) {
        // Turn towards x_thrust/y_thrust
        if (!isNaN(thrust_angle)) {
        if (thrust_angle < Math.PI-OFFSET_ALLOWED_BACKWARDS && thrust_angle > -Math.PI+OFFSET_ALLOWED_BACKWARDS) {
          this.rotate(Mymath.clampRot(thrust_angle));
        } else {
          sign = -1;
          if (thrust_angle > 0) {
            thrust_angle = -(Math.PI - thrust_angle);
          } else if (thrust_angle < 0) {
            thrust_angle = -(-Math.PI + thrust_angle);
          }
          this.rotate(Mymath.clampRot(thrust_angle));
        }
      }

        // Thrust if we're aligned correctly;
        if (thrust_angle < OFFSET_ALLOWED && thrust_angle > -OFFSET_ALLOWED) {
          var actual_thrust = Mymath.clampThrust(thrust_vec.modulus()*sign*500);
          this.ai.state.lthrust = actual_thrust;
          this.thrust(actual_thrust); //todo lower/max thrust?
        }
      } else {
        // If we have a small thrust vector, let's just point towards the enemy ship..
        this.rotate(rot);
      }
    }

    /* Prevent unused controllers from going wild */
    if (this.ai.brain == "v1") {
      this.ai.controllers.posXPID.integralError = 0;
      this.ai.controllers.posYPID.integralError = 0;
    } else if (this.ai.brain == "v2") {
      this.ai.controllers.rotPID.integralError = 0;
      this.ai.controllers.movPID.integralError = 0;
    }

    // store state/data for gfx stuff
    this.ai.state.x_thrust = x_thrust;
    this.ai.state.y_thrust = y_thrust;

    // Check if we need to call callback
    if (this.ai.targetcallback !== null) {
      if (pos_vec_error.modulus() < 50 && this.movementVec.modulus() < 0.75) {
        this.ai.targetcallback();
      }
    }
  };

  Ship.prototype.rotate = function(radians) {
    this.rotationVec = this.rotationVec.rotate(radians, $V([0,0])).toUnitVector();
  };

  Ship.prototype.thrust = function(multiply) {
    multiply = Mymath.clamp(multiply,-1,1);
    this.movementVec = this.movementVec.add(this.thrustVec.rotate(this.thrustVec.angleTo(this.rotationVec), $V([0,0])).multiply(multiply));
  };

  Ship.prototype.GFXTick = function() {
    this.gfx.graph.graphics.clear();
    this.gfx.graph.rotation = -this.rotation;

    if (gameState.debugging.shiplines) {
      var stroke = "rgba(0,0,255,1)";
      if (this.ai.brain == "v1") {
        stroke = "rgba(255,0,0,1)";
      }
      this.gfx.graph.graphics.beginStroke(stroke).moveTo(0, 0).lineTo(this.ai.state.x_thrust, this.ai.state.y_thrust).endStroke();

      if (this.ai.target !== null && this.ai.target.hasOwnProperty("positionVec")) {
        var interception = this.getFire();
        if (interception !== null) {
          this.gfx.graph.graphics.beginStroke("rgba(0,255,0,1)").moveTo(0, 0).lineTo(interception.e(1), interception.e(2)).endStroke();
        }
      }
    }
  };

  Ship.prototype.fire = function() {
    var interception = this.getFire();
    if (interception !== null) {
      var bullet = new Bullet(this.positionVec, this.movementVec.add(interception.toUnitVector().multiply(this.stats.bulletspeed)).rotate(Math.random()*0.0000000523598776, $V([0,0])));
      bullets.push(bullet);
      stage.addChild(bullet);
    }
  };

  Ship.prototype.getFire = function() {
    var interception = Mymath.intercept(this.positionVec, this.stats.bulletspeed, this.ai.target.positionVec, this.ai.target.movementVec);
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

  return Ship;
});

