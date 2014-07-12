var starmap = {};
var phonetics;
var gameState = {
  player: {
    currentstar: null,
    ship: null
  },
  containers: {
    solarSystem: null,
    osd: null,
    osd_world: null,
    parallax: null
  },
  universe: {
    ships: [],
    starmap: null
  },
  debugging: {
    shiplines: false
  }
};
var miscDebug = {};
var stage;
var queue;
var radar;
var starmapradar;
var ticking = true;
var textlines = [];
var eventHub = {};
var bullets = [];
var graphwidget;
var updatables = [];






requirejs.config({
    paths: {
        json: [
            '/bower_components/requirejs-plugins/src/json'
        ],
        text: [
            '/bower_components/requirejs-plugins/lib/text'
        ],
        watch: [
            '/bower_components/watch/src/watch.min'
        ],
        chartjs: [
            '/bower_components/chartjs/Chart.min'
        ]
    }
});

require(
  [
    "ship",
    "namegen", 
    "star", 
    "starmap", 
    "json!/content/meta/content.json", 
    "radar", 
    "starmapradar", 
    "starwidget", 
    "graphwidget"
  ], function
  (
    Ship,
    Phonetics, 
    Star, 
    Starmap, 
    contentJSON, 
    Radar, 
    StarmapRadar, 
    StarWidget, 
    GraphWidget
  ) {
  function init() {
    stage = new createjs.Stage("myCanvas");
    queue = new createjs.LoadQueue();
    queue.addEventListener("complete", initGame);
    queue.addEventListener("complete", generateStarmap);
    queue.addEventListener("complete", populateUniverse);
    queue.addEventListener("complete", setupWidgets); // TODO: figure out why this causes an infinite loop if placed below generateStarmap and populateUniverse..
    queue.loadManifest(contentJSON.files);

    createjs.Ticker.setFPS(60);
    createjs.EventDispatcher.initialize(eventHub);
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
      text.y = 10 + (10 * i);
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
    var xobserver = new PathObserver(stage, 'scaleX');
    xobserver.open(function(newValue, oldValue) {
      generateParallax();
    });
    var yobserver = new PathObserver(stage, 'scaleY');
    yobserver.open(function(newValue, oldValue) {
      generateParallax();
    });

    // Regenerate whenever we resize our window.
    //TODO! For some reason, WatchJS and PathObserver can't do this, and binding the onresize event to myCanvas doesn't work either. Shit.

    // Generate parallaxes
    generateParallax();
  }

  function generateParallax() {
    // Remove all old parallaxes first if they exist
    gameState.containers.parallax.removeAllChildren();

    // Setup parallax
    gameState.containers.parallax.addChild(new Parallax("parallax0", 0));
    gameState.containers.parallax.addChild(new Parallax("parallax1", 1/50));
    gameState.containers.parallax.addChild(new Parallax("parallax2", 1/30));
    gameState.containers.parallax.addChild(new Parallax("parallax3", 1/10));
    gameState.containers.parallax.addChild(new Parallax("parallax4", 1/1));
  }

  function populateUniverse(event) {
    gameState.player.ship = new Ship({"is_ai": false});
    gameState.player.ship.positionVec = $V([200,300]);

    for (var i = 0; i < 50; i++) {
      spawnRandomShip(true);
    }
    for (var i = 0; i < 50; i++) {
      spawnRandomShip(false);
    }

    // Add ship
    stage.addChild(gameState.player.ship);
  }

  function tick(event) {
    if (ticking) {

      eventHub.dispatchEvent("movementTick");
      eventHub.dispatchEvent("AITick");
      eventHub.dispatchEvent("GFXTick");

      debugtick();

      if (Keyboard.isPressed(65)) { //A
        gameState.player.ship.rotate(Math.PI * -0.01);
      }
      if (Keyboard.isPressed(68)) { //D
        gameState.player.ship.rotate(Math.PI * 0.01);
      }
      if (Keyboard.isPressed(87)) { //W
        gameState.player.ship.thrust(1);
      }
      if (Keyboard.isPressed(83)) { //S
        gameState.player.ship.thrust(-1);
      }

      stage.regX = gameState.player.ship.positionVec.e(1) - myCanvas.width*0.5*(1/stage.scaleX);
      stage.regY = gameState.player.ship.positionVec.e(2) - myCanvas.height*0.5*(1/stage.scaleY);
      gameState.containers.osd.x = stage.regX;
      gameState.containers.osd.y = stage.regY;

      // update radar
      radar.update();

      _.forEach(updatables, function(updatable) {
        updatable.update();
      });

      // update stage
      stage.update();
    }
  }

  function debugtick(event) {
    if (miscDebug.debugship != null) {
      textlines[0].text = "Debugship stats-------";
      textlines[7].text = " rot.mP : " + Mymath.prettyfloat(miscDebug.debugship.ai.controllers.rotPID.last.mP);
      textlines[8].text = " rot.mI : " + Mymath.prettyfloat(miscDebug.debugship.ai.controllers.rotPID.last.mI);
      textlines[9].text = " rot.mD : " + Mymath.prettyfloat(miscDebug.debugship.ai.controllers.rotPID.last.mD);
      textlines[10].text = "-"
      textlines[11].text = " mov.mP : " + Mymath.prettyfloat(miscDebug.debugship.ai.controllers.movPID.last.mP);
      textlines[12].text = " mov.mI : " + Mymath.prettyfloat(miscDebug.debugship.ai.controllers.movPID.last.mI);
      textlines[13].text = " mov.mD : " + Mymath.prettyfloat(miscDebug.debugship.ai.controllers.movPID.last.mD);
      textlines[15].text = " thrust : " + Mymath.prettyfloat(miscDebug.debugship.ai.state.lthrust);
    }
  }

  function recreateSolarSystem() {
    gameState.containers.solarSystem.removeAllChildren();
    gameState.containers.solarSystem.removeAllEventListeners();

    gameState.containers.solarSystem.addChild(gameState.player.currentstar);
    _.each(gameState.player.currentstar.planets, function(planet, index){
      gameState.containers.solarSystem.addChild(planet);
      planet.addEventListener('click', function() {
        alert(planet);
      });
    });

    _.each(gameState.player.currentstar.jumpgates, function(jumpgate, index){
      gameState.containers.solarSystem.addChild(jumpgate);
      jumpgate.addEventListener('click', function() {
        alert(jumpgate);
      });
    });
  }
  miscDebug.recS = recreateSolarSystem;
  // Recreate whenever the player changes star
  var starobserver = new PathObserver(gameState, 'player.currentstar');
  starobserver.open(function(newValue, oldValue) {
    console.log("Changing solar system; recreating solar system gfx...");
    recreateSolarSystem();
  });

  function generateStarmap() {
    // Generate starmap    
    starmap = new Starmap();
    gameState.universe.starmap = starmap;
    // Set player position to first star
    gameState.player.currentstar = starmap.stars[0];
  }

  function setupWidgets() {
    starwidget = new StarWidget("#starDetails");
    radar = new Radar();
    starmapradar = new StarmapRadar();

    window.GraphWidget = GraphWidget;

    var graphWidgetContainer = $("<div class='game-ui-widget'></div>");
    $("#widgets").append(graphWidgetContainer);
    graphwidget = new GraphWidget(graphWidgetContainer, gameState.player.ship, "movementVec", {}, function(invalue){return invalue.modulus()});

    updatables.push(graphwidget);
  }

  function spawnRandomShip(isPlanetTargetter) {
    if (isPlanetTargetter == undefined) {
      isPlanetTargetter = true;
    }
    var ship = new Ship({
      "gfxID": (isPlanetTargetter ? "ship2" : "ship5")
    });
    ship.positionVec = $V([Math.random() * 1500 - 750, Math.random() * 1500 - 750]);

    var getNextTarget = function(){return null};
    if (isPlanetTargetter) {
      getNextTarget = function() {
        return _.sample(gameState.player.currentstar.planets);
      }
    } else {
      getNextTarget = function() {
        return _.sample(gameState.universe.ships);
      }
    }

    ship.ai.target = getNextTarget();
    ship.ai.targetcallback = function() {
      ship.ai.target = getNextTarget();
      ship.ai.controllers.posXPID.reset();
      ship.ai.controllers.posYPID.reset();
    };
    gameState.universe.ships.push(ship);
    stage.addChild(ship);
  }


  $(function(){   
    // Init createJS
    init();

    // Do misc stuff
    miscDebug.phonetics = new Phonetics();
  });
});