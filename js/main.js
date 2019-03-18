const _ = require("lodash");
const Parallax = require("./parallax");
const Sylvester = require("./sylvester-withmods.js");
const Mymath = require("./mymath.js");
const gameState = require("./gameState");
const Stage = require("./stage");
const Noty = require("noty");
const Ship = require("./ship");
const Bullet = require("./bullet");
const Starmap = require("./starmap");
const contentJSON = require("../content/meta/content.json");
const Radar = require("./radar");
const StarmapRadar = require("./starmapradar");
const StarWidget = require("./starwidget");
const GraphWidget = require("./graphwidget");
const Keyboard = require("./keyboard");
const queue = require("./loadQueue");
const NotificationSystem = require('./notificationSystem');
const BrainV1 = require('./autopilot/v1')
const BrainV2 = require('./autopilot/v2')

const miscDebug = {};
const textlines = [];
const updatables = [];

let ticking = true;
let stage;
let radar;
let starmapradar;
let graphwidget;
let notificationSystem;

function init() {
  Stage.init();
  stage = Stage.get();

  queue.addEventListener("complete", initGame);
  queue.addEventListener("complete", generateStarmap);
  queue.addEventListener("complete", populateUniverse);
  queue.addEventListener("complete", setupWidgets);
  queue.loadManifest(contentJSON.files);

  notificationSystem = new NotificationSystem('#updateBar', '#updateBubble')

  createjs.Ticker.setFPS(60);
}

function initGame() {
  gameState.containers.osd = new createjs.Container();
  gameState.containers.osd_world = new createjs.Container();
  gameState.containers.solarSystem = new createjs.Container();
  gameState.containers.parallax = new createjs.Container();

  // Setup debug textlines
  for (var i = 0; i < 100; i++) {
    var text = new createjs.Text("", "12px monospace", "#aaaaaa");
    text.x = 10;
    text.y = 200 + 10 * i;
    text.textBaseline = "alphabetic";
    gameState.containers.osd.addChild(text);
    textlines.push(text);
  }

  // Toggle debugging when pressing F1
  Keyboard.onKeyDown(112, (evt) => {
    gameState.debugging.shiplines = !gameState.debugging.shiplines;
    evt.preventDefault();
  });

  setupParallax();

  // Setup solar system container
  stage.addChild(gameState.containers.solarSystem);

  // Set up OSD (GUI) last
  stage.addChild(gameState.containers.osd, gameState.containers.osd_world);

  //finally set up tick eventlistener
  createjs.Ticker.addEventListener("tick", tick);
}

function setupParallax() {
  // Add parallax container to stage
  stage.addChild(gameState.containers.parallax);

  // Regenerate whenever our zoom level changes.
  // todo: implement
  /*
  var xobserver = new PathObserver(stage, "scaleX");
  xobserver.open(function(newValue, oldValue) {
    generateParallax();
  });
  var yobserver = new PathObserver(stage, "scaleY");
  yobserver.open(function(newValue, oldValue) {
    generateParallax();
  });
  */

  // Regenerate whenever we resize our window.
  //TODO! For some reason, WatchJS and PathObserver can't do this, and binding the onresize event to myCanvas doesn't work either. Shit.

  // Generate parallaxes
  generateParallax();
}

function generateParallax() {
  // Remove all old parallaxes first if they exist
  gameState.containers.parallax.removeAllChildren();

  // Setup parallax
  gameState.containers.parallax.addChild(
    new Parallax("parallax0", 0, queue, stage)
  );
  gameState.containers.parallax.addChild(
    new Parallax("parallax1_0", 1 / 50, queue, stage)
  );
  gameState.containers.parallax.addChild(
    new Parallax("parallax2", 1 / 30, queue, stage)
  );
  gameState.containers.parallax.addChild(
    new Parallax("parallax3", 1 / 10, queue, stage)
  );
  gameState.containers.parallax.addChild(
    new Parallax("parallax4", 1 / 1, queue, stage)
  );
}

function populateUniverse(event) {
  gameState.player.ship = new Ship({ is_ai: false });
  gameState.player.ship.positionVec = new Sylvester.Vector([200, 300]);
  stage.addChild(gameState.player.ship);

  for (var i = 0; i < 10; i++) {
    spawnRandomShip(true);
  }

  let s = spawnRandomShip(false);
  s.subsystems.autopilot.target = gameState.player.ship;
}

function tick(event) {
  if (ticking) {
    for (let c of stage.children) {
      if (c.movementTick) {
        c.movementTick(event);
      }
      if (c.AITick) {
        c.AITick(event);
      }
      if (c.GFXTick) {
        c.GFXTick(event);
      }

      if (c instanceof Bullet) {
        // test if it's close to a ship
        for (let s of stage.children.filter(x => x instanceof Ship && x !== c.owner)) {
          if (Math.pow(s.x - c.x, 2) + Math.pow(s.y - c.y, 2) < 300) {
            const evt = new createjs.Event("hit", false, true);
            // when shields are implemented: use evt.stopImmediatePropagation() inside shields.
            evt.data = { damage: 1, perpetrator: c.owner }; // TODO: base damage on bullet's damage stats. TODO: use owner objectID or something similar? What would happen if `owner` is destroyed?
            s.dispatchEvent(evt)
            c.destroy();
          }
        }
      }
    }
    for (let c of gameState.containers.parallax.children) {
      if (c.GFXTick) {
        c.GFXTick(event);
      }
    }

    debugtick();

    if (Keyboard.isPressed(65)) {
      //A
      gameState.player.ship.rotate(Math.PI * -0.01);
    }
    if (Keyboard.isPressed(68)) {
      //D
      gameState.player.ship.rotate(Math.PI * 0.01);
    }
    if (Keyboard.isPressed(87)) {
      //W
      gameState.player.ship.thrust(1);
    }
    if (Keyboard.isPressed(83)) {
      //S
      gameState.player.ship.thrust(-1);
    }
    if (Keyboard.isPressed(32)) {
      // space
      gameState.player.ship.fire();
    }

    stage.regX =
      gameState.player.ship.positionVec.e(1) -
      myCanvas.width * 0.5 * (1 / stage.scaleX);
    stage.regY =
      gameState.player.ship.positionVec.e(2) -
      myCanvas.height * 0.5 * (1 / stage.scaleY);
    gameState.containers.osd.x = stage.regX;
    gameState.containers.osd.y = stage.regY;

    // update radar
    if (radar) {
      radar.update();
    }

    _.forEach(updatables, function (updatable) {
      updatable.update();
    });

    // update stage
    stage.update();
  }
}

function debugtick(event) {
  if (miscDebug.debugship != null) {
    textlines[0].text = "Debugship stats-------";
    if (miscDebug.debugship.subsystems.autopilot instanceof BrainV1) {
      textlines[2].text =
        " rot.mP : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.rotPID.last.mP);
      textlines[3].text =
        " rot.mI : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.rotPID.last.mI);
      textlines[4].text =
        " rot.mD : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.rotPID.last.mD);
      textlines[5].text = "-";
      textlines[6].text =
        " mov.mP : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.movPID.last.mP);
      textlines[7].text =
        " mov.mI : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.movPID.last.mI);
      textlines[8].text =
        " mov.mD : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.movPID.last.mD);
    } else if (miscDebug.debugship.subsystems.autopilot instanceof BrainV2) {
      textlines[2].text =
        " posXPID.mP : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.posXPID.last.mP);
      textlines[3].text =
        " posXPID.mI : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.posXPID.last.mI);
      textlines[4].text =
        " posXPID.mD : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.posXPID.last.mD);
      textlines[5].text = "-";
      textlines[6].text =
        " posYPID.mP : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.posYPID.last.mP);
      textlines[7].text =
        " posYPID.mI : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.posYPID.last.mI);
      textlines[8].text =
        " posYPID.mD : " +
        Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.controllers.posYPID.last.mD);
      textlines[9].text =
        " thrust : " + Mymath.prettyfloat(miscDebug.debugship.subsystems.autopilot.state.lthrust);
    }
  }
}

function recreateSolarSystem() {
  gameState.containers.solarSystem.removeAllChildren();
  gameState.containers.solarSystem.removeAllEventListeners();

  gameState.containers.solarSystem.addChild(gameState.player.currentstar);
  _.each(gameState.player.currentstar.planets, function (planet, index) {
    gameState.containers.solarSystem.addChild(planet);
    planet.addEventListener("click", function () {
      alert(planet);
    });
  });

  _.each(gameState.player.currentstar.jumpgates, function (jumpgate, index) {
    gameState.containers.solarSystem.addChild(jumpgate);
    jumpgate.addEventListener("click", function () {
      if (
        (jumpgate.x - gameState.player.ship.x) *
        (jumpgate.x - gameState.player.ship.x) +
        (jumpgate.y - gameState.player.ship.y) *
        (jumpgate.y - gameState.player.ship.y) <
        10000
      ) {
        let n = new Noty({
          text: "Do you want to jump to " + jumpgate.linkedstar.name + "?",
          layout: "bottomRight",
          type: "alert",
          buttons: [
            Noty.button("Ok", "btn btn-primary", function ($noty) {
              $noty.close();
              // Jump to star
              var prevStar = gameState.player.currentstar;
              gameState.player.currentstar = jumpgate.linkedstar;
              // Set player position at jumpgate to previous star
              console.log(prevStar);
              console.log(gameState.player.currentstar);
              var prevjg = _.find(
                gameState.player.currentstar.jumpgates,
                function (jg) {
                  return jg.linkedstar == prevStar;
                }
              );
              console.log(prevjg);
              gameState.player.ship.positionVec = new Sylvester.Vector([
                prevjg.x,
                prevjg.y
              ]);
            }),
            Noty.button("Cancel", "btn btn-danger", noty => {
              noty.close();
            })
          ]
        });
        n.show();
        window.n = n;
      }
    });
  });
}
miscDebug.recS = recreateSolarSystem;
// Recreate whenever the player changes star
gameState.on("starChanged", () => {
  console.log("Changing solar system; recreating solar system gfx...");
  recreateSolarSystem();
});

function generateStarmap() {
  // Generate starmap
  gameState.universe.starmap = new Starmap();
  // Set player position to first star
  gameState.player.currentstar = gameState.universe.starmap.stars[0];

  // generate gfx for initial star
  recreateSolarSystem();
}

function setupWidgets() {
  starwidget = new StarWidget("#starDetails");
  radar = new Radar();
  starmapradar = new StarmapRadar();

  window.GraphWidget = GraphWidget;
  var graphWidgetContainer = document.createElement("div");
  graphWidgetContainer.classList.add("game-ui-widget");
  document.querySelector("#widgets").append(graphWidgetContainer);
  graphwidget = new GraphWidget(graphWidgetContainer, {}, function (invalue) {
    return gameState.player.ship.movementVec.modulus();
  });
  updatables.push(graphwidget);
}

function spawnRandomShip(isPlanetTargetter) {
  if (isPlanetTargetter == undefined) {
    isPlanetTargetter = true;
  }
  var ship = new Ship(
    {
      gfxID: isPlanetTargetter ? "ship2" : "ship5",
      stats: {
        maxspeed: new Sylvester.Vector([3, 0]),
        bulletspeed: 10,
        bulletlifetime: 1000
      }
    }
  );
  ship.positionVec = new Sylvester.Vector([
    Math.random() * 1500 - 750,
    Math.random() * 1500 - 750
  ]);

  var getNextTarget = function () {
    return null;
  };
  if (isPlanetTargetter) {
    getNextTarget = function () {
      return _.sample(gameState.player.currentstar.planets);
    };
  } else {
    getNextTarget = function () {
      return _.sample(stage.children.filter(x => x instanceof Ship));
    };
  }

  ship.subsystems.autopilot.target = getNextTarget();
  ship.subsystems.autopilot.targetcallback = function () {
    if (isPlanetTargetter) {
      notificationSystem.push('shipLanded', "A ship (" + ship.name + ") has landed on planet " + ship.subsystems.autopilot.target.name)
    }
    ship.subsystems.autopilot.target = getNextTarget();
    ship.subsystems.autopilot.controllers.posXPID.reset();
    ship.subsystems.autopilot.controllers.posYPID.reset();
  };
  stage.addChild(ship);
  return ship;
}

document.addEventListener("DOMContentLoaded", function (event) {
  // Init createJS
  init();

  // Do misc stuff
  window.miscDebug = miscDebug;
  miscDebug.gameState = gameState;
  miscDebug.stage = stage;
});
