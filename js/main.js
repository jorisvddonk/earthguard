const _ = require("lodash");
const Parallax = require("./parallax");
const Sylvester = require("./sylvester-withmods.js");
const Mymath = require("./mymath.js");
const gameState = require("./gameState");
const eventHub = require("./eventHub");
const Stage = require("./stage");
const Noty = require("noty");
const Ship = require("./ship");
const Starmap = require("./starmap");
const contentJSON = require("../content/meta/content.json");
const Radar = require("./radar");
const StarmapRadar = require("./starmapradar");
const StarWidget = require("./starwidget");
const GraphWidget = require("./graphwidget");
const Keyboard = require("./keyboard");
const queue = require("./loadQueue");
const NotificationSystem = require('./notificationSystem');

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
    text.y = 10 + 10 * i;
    text.textBaseline = "alphabetic";
    gameState.containers.osd.addChild(text);
    textlines.push(text);
  }

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
    new Parallax("parallax0", 0, queue, stage, eventHub)
  );
  gameState.containers.parallax.addChild(
    new Parallax("parallax1_0", 1 / 50, queue, stage, eventHub)
  );
  gameState.containers.parallax.addChild(
    new Parallax("parallax2", 1 / 30, queue, stage, eventHub)
  );
  gameState.containers.parallax.addChild(
    new Parallax("parallax3", 1 / 10, queue, stage, eventHub)
  );
  gameState.containers.parallax.addChild(
    new Parallax("parallax4", 1 / 1, queue, stage, eventHub)
  );
}

function populateUniverse(event) {
  gameState.player.ship = new Ship({ is_ai: false }, eventHub);
  gameState.player.ship.positionVec = new Sylvester.Vector([200, 300]);
  stage.addChild(gameState.player.ship);

  for (var i = 0; i < 10; i++) {
    spawnRandomShip(true);
  }

  spawnRandomShip(false);
  gameState.universe.ships[0].ai.target = gameState.player.ship;
}

function tick(event) {
  if (ticking) {
    eventHub.dispatchEvent("movementTick");
    eventHub.dispatchEvent("AITick");
    eventHub.dispatchEvent("GFXTick");

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
    textlines[7].text =
      " rot.mP : " +
      Mymath.prettyfloat(miscDebug.debugship.ai.controllers.rotPID.last.mP);
    textlines[8].text =
      " rot.mI : " +
      Mymath.prettyfloat(miscDebug.debugship.ai.controllers.rotPID.last.mI);
    textlines[9].text =
      " rot.mD : " +
      Mymath.prettyfloat(miscDebug.debugship.ai.controllers.rotPID.last.mD);
    textlines[10].text = "-";
    textlines[11].text =
      " mov.mP : " +
      Mymath.prettyfloat(miscDebug.debugship.ai.controllers.movPID.last.mP);
    textlines[12].text =
      " mov.mI : " +
      Mymath.prettyfloat(miscDebug.debugship.ai.controllers.movPID.last.mI);
    textlines[13].text =
      " mov.mD : " +
      Mymath.prettyfloat(miscDebug.debugship.ai.controllers.movPID.last.mD);
    textlines[15].text =
      " thrust : " + Mymath.prettyfloat(miscDebug.debugship.ai.state.lthrust);
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
      console.log("Clicked jumpgate");
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
      thrustVec: new Sylvester.Vector([0.05, 0]),
      stats: {
        maxspeed: new Sylvester.Vector([3, 0]),
        bulletspeed: 10,
        bulletlifetime: 1000
      }
    },
    eventHub
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
      return _.sample(gameState.universe.ships);
    };
  }

  ship.ai.target = getNextTarget();
  ship.ai.targetcallback = function () {
    if (isPlanetTargetter) {
      notificationSystem.push('shipLanded', "A ship (" + ship.name + ") has landed on planet " + ship.ai.target.name)
    }
    ship.ai.target = getNextTarget();
    ship.ai.controllers.posXPID.reset();
    ship.ai.controllers.posYPID.reset();
  };
  gameState.universe.ships.push(ship);
  stage.addChild(ship);
}

document.addEventListener("DOMContentLoaded", function (event) {
  // Init createJS
  init();

  // Do misc stuff
  window.miscDebug = miscDebug;
  miscDebug.gameState = gameState;
});
