import _ from 'lodash'
import Noty from 'noty'
import contentJSON from '../content/meta/content.json'
import { AutopilotV2 } from './autopilot/v2'
import Bullet from './bullet'
import gameState from './gameState'
import GraphWidget from './graphwidget'
import Keyboard from './keyboard'
import queue from './loadQueue'
import Mymath from './mymath'
import NotificationSystem from './notificationSystem'
import ObjectRegistry from './objectRegistry'
import Parallax from './parallax'
import Radar from './radar'
import Ship from './ship'
import Stage from './stage'
import Starmap from './starmap'
import StarmapRadar from './starmapradar'
import { StarWidget } from './starwidget'
import { createTask, TaskType } from './targets'
import Sylvester from './sylvester-withmods'
import { readFileSync } from 'fs'
import { NotyQuestmark } from './NotyQuestmark'

const miscDebug = {}
const textlines = []
const updatables = []

const ticking = true
let stage
let radar
let starmapradar
let starwidget
let graphwidget

function init() {
  Stage.init()
  stage = Stage.get()

  queue.addEventListener('complete', initGame)
  queue.addEventListener('complete', generateStarmap)
  queue.addEventListener('complete', populateUniverse)
  queue.addEventListener('complete', setupWidgets)
  queue.loadManifest(contentJSON.files)

  NotificationSystem.init('#updateBar', '#updateBubble')

  createjs.Ticker.setFPS(60)
}

function initGame() {
  gameState.containers.osd = new createjs.Container()
  gameState.containers.osd_world = new createjs.Container()
  gameState.containers.solarSystem = new createjs.Container()
  gameState.containers.parallax = new createjs.Container()

  // Setup debug textlines
  for (let i = 0; i < 100; i++) {
    const text = new createjs.Text('', '12px monospace', '#aaaaaa')
    text.x = 10
    text.y = 200 + 10 * i
    text.textBaseline = 'alphabetic'
    gameState.containers.osd.addChild(text)
    textlines.push(text)
  }

  // Toggle debugging when pressing F1
  Keyboard.onKeyDown(112, evt => {
    gameState.debugging.shiplines = !gameState.debugging.shiplines
    evt.preventDefault()
  })

  // Zoom out when pressing minus
  Keyboard.onKeyDown(189, evt => {
    stage.scaleX *= 0.5
    stage.scaleY *= 0.5
    generateParallax()
    evt.preventDefault()
  })
  // Zoom in when pressing plus
  Keyboard.onKeyDown(187, evt => {
    stage.scaleX *= 2.0
    stage.scaleY *= 2.0
    generateParallax()
    evt.preventDefault()
  })

  setupParallax()

  // Setup solar system container
  stage.addChild(gameState.containers.solarSystem)

  // Set up OSD (GUI) last
  stage.addChild(gameState.containers.osd, gameState.containers.osd_world)

  // finally set up tick eventlistener
  createjs.Ticker.addEventListener('tick', tick)
}

function setupParallax() {
  // Add parallax container to stage
  stage.addChild(gameState.containers.parallax)

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
  // TODO! For some reason, WatchJS and PathObserver can't do this, and binding the onresize event to myCanvas doesn't work either. Shit.

  // Generate parallaxes
  generateParallax()
}

function generateParallax() {
  // Remove all old parallaxes first if they exist
  gameState.containers.parallax.removeAllChildren()

  // Setup parallax
  const myCanvas = document.getElementById('myCanvas')
  gameState.containers.parallax.addChild(
    new Parallax('parallax0', 0, queue, myCanvas)
  )
  gameState.containers.parallax.addChild(
    new Parallax('parallax1_0', 1 / 50, queue, myCanvas)
  )
  gameState.containers.parallax.addChild(
    new Parallax('parallax2', 1 / 30, queue, myCanvas)
  )
  gameState.containers.parallax.addChild(
    new Parallax('parallax3', 1 / 10, queue, myCanvas)
  )
  gameState.containers.parallax.addChild(
    new Parallax('parallax4', 1 / 1, queue, myCanvas)
  )
}

function populateUniverse(event) {
  gameState.player.ship = new Ship({ is_ai: false, faction: 'Player' })
  gameState.player.ship.positionVec = new Sylvester.Vector([200, 300])
  stage.addChild(gameState.player.ship)

  for (let i = 0; i < 30; i++) {
    spawnRandomShip()
  }
}

function tick(event) {
  if (ticking) {
    for (const c of stage.children) {
      if (c.movementTick) {
        c.movementTick(event)
      }
      if (c.tick) {
        c.tick(event)
      }
      if (c.GFXTick) {
        c.GFXTick(event)
      }

      if (c instanceof Bullet) {
        // test if it's close to a ship
        for (const s of stage.children.filter(
          x =>
            x instanceof Ship && x !== c.owner && c.owner.faction !== x.faction
        )) {
          if (Math.pow(s.x - c.x, 2) + Math.pow(s.y - c.y, 2) < 300) {
            const evt = new createjs.Event('hit', false, true)
            // when shields are implemented: use evt.stopImmediatePropagation() inside shields.
            evt.data = { damage: 1, perpetrator: c.owner } // TODO: base damage on bullet's damage stats. TODO: use owner objectID or something similar? What would happen if `owner` is destroyed?
            s.dispatchEvent(evt)
            c.destroy()
          }
        }
      }
    }
    for (const c of gameState.containers.parallax.children) {
      if (c.GFXTick) {
        c.GFXTick(event)
      }
    }

    debugtick()

    if (Keyboard.isPressed(65)) {
      // A
      gameState.player.ship.rotate(Math.PI * -0.01)
    }
    if (Keyboard.isPressed(68)) {
      // D
      gameState.player.ship.rotate(Math.PI * 0.01)
    }
    if (Keyboard.isPressed(87)) {
      // W
      gameState.player.ship.thrust(1)
    }
    if (Keyboard.isPressed(83)) {
      // S
      gameState.player.ship.thrust(-1)
    }
    if (Keyboard.isPressed(32)) {
      // space
      gameState.player.ship.fire()
    }

    stage.regX =
      gameState.player.ship.positionVec.e(1) -
      myCanvas.width * 0.5 * (1 / stage.scaleX)
    stage.regY =
      gameState.player.ship.positionVec.e(2) -
      myCanvas.height * 0.5 * (1 / stage.scaleY)
    gameState.containers.osd.x = stage.regX
    gameState.containers.osd.y = stage.regY

    // update radar
    if (radar) {
      radar.update()
    }

    _.forEach(updatables, updatable => {
      updatable.update()
    })

    // update stage
    stage.update()
  }
}

function debugtick(event) {
  if (miscDebug.debugship != null) {
    try {
      textlines[0].text = 'Debugship stats-------'
      if (miscDebug.debugship.subsystems.autopilot instanceof AutopilotV2) {
        textlines[2].text =
          ' posXPID.mP : ' +
          Mymath.prettyfloat(
            miscDebug.debugship.subsystems.autopilot.controllers.posXPID.last.mP
          )
        textlines[3].text =
          ' posXPID.mI : ' +
          Mymath.prettyfloat(
            miscDebug.debugship.subsystems.autopilot.controllers.posXPID.last.mI
          )
        textlines[4].text =
          ' posXPID.mD : ' +
          Mymath.prettyfloat(
            miscDebug.debugship.subsystems.autopilot.controllers.posXPID.last.mD
          )
        textlines[5].text = '-'
        textlines[6].text =
          ' posYPID.mP : ' +
          Mymath.prettyfloat(
            miscDebug.debugship.subsystems.autopilot.controllers.posYPID.last.mP
          )
        textlines[7].text =
          ' posYPID.mI : ' +
          Mymath.prettyfloat(
            miscDebug.debugship.subsystems.autopilot.controllers.posYPID.last.mI
          )
        textlines[8].text =
          ' posYPID.mD : ' +
          Mymath.prettyfloat(
            miscDebug.debugship.subsystems.autopilot.controllers.posYPID.last.mD
          )
        textlines[9].text =
          ' thrust : ' +
          Mymath.prettyfloat(
            miscDebug.debugship.subsystems.autopilot.state.lthrust
          )
      }
    } catch (e) {
      console.error(e)
    }
  }
}

function recreateSolarSystem() {
  gameState.containers.solarSystem.removeAllChildren()
  gameState.containers.solarSystem.removeAllEventListeners()

  gameState.containers.solarSystem.addChild(gameState.player.currentstar)
  _.each(gameState.player.currentstar.planets, (planet, index) => {
    gameState.containers.solarSystem.addChild(planet)
  })

  _.each(gameState.player.currentstar.jumpgates, (jumpgate, index) => {
    gameState.containers.solarSystem.addChild(jumpgate)
    jumpgate.addEventListener('click', () => {
      if (
        (jumpgate.x - gameState.player.ship.x) *
          (jumpgate.x - gameState.player.ship.x) +
          (jumpgate.y - gameState.player.ship.y) *
            (jumpgate.y - gameState.player.ship.y) <
        10000
      ) {
        const n = new Noty({
          text: 'Do you want to jump to ' + jumpgate.linkedstar.name + '?',
          layout: 'bottomRight',
          type: 'alert',
          buttons: [
            Noty.button('Ok', 'btn btn-primary', $noty => {
              $noty.close()
              // Jump to star
              const prevStar = gameState.player.currentstar
              gameState.player.currentstar = jumpgate.linkedstar
              // Set player position at jumpgate to previous star
              console.log(prevStar)
              console.log(gameState.player.currentstar)
              const prevjg = _.find(
                gameState.player.currentstar.jumpgates,
                jg => {
                  return jg.linkedstar === prevStar
                }
              )
              console.log(prevjg)
              gameState.player.ship.positionVec = new Sylvester.Vector([
                prevjg.x,
                prevjg.y,
              ])
            }),
            Noty.button('Cancel', 'btn btn-danger', noty => {
              noty.close()
            }),
          ],
        })
        n.show()
        window.n = n
      }
    })
  })
}
miscDebug.recS = recreateSolarSystem
// Recreate whenever the player changes star
gameState.on('starChanged', () => {
  console.log('Changing solar system; recreating solar system gfx...')
  recreateSolarSystem()
})

function generateStarmap() {
  // Generate starmap
  gameState.universe.starmap = new Starmap()
  // Set player position to first star
  gameState.player.currentstar = gameState.universe.starmap.stars[0]

  // generate gfx for initial star
  recreateSolarSystem()
}

function setupWidgets() {
  starwidget = new StarWidget('#starDetails')
  radar = new Radar()
  starmapradar = new StarmapRadar()

  window.GraphWidget = GraphWidget
  const graphWidgetContainer = document.createElement('div')
  graphWidgetContainer.classList.add('game-ui-widget')
  document.querySelector('#widgets').append(graphWidgetContainer)
  graphwidget = new GraphWidget(graphWidgetContainer, {}, () => {
    return gameState.player.ship.movementVec.modulus()
  })
  updatables.push(graphwidget)
}

function spawnRandomShip() {
  const faction = _.sample([
    'Civilians',
    'Civilians',
    'Civilians',
    'Pirates',
    'Police',
    'Police',
    'AnnoyingFan',
  ])
  const gfxID = {
    Civilians: 'ship2',
    Pirates: 'ship5',
    Police: 'ship6',
    AnnoyingFan: 'ship7',
  }[faction]
  const getShipOfFaction = factionName => {
    return _.sample(
      stage.children.filter(
        x => x instanceof Ship && x.faction.name === factionName
      )
    )
  }
  const getNextTask = {
    Civilians: () => {
      const tgt = _.sample(gameState.player.currentstar.planets)
      if (tgt) {
        return createTask(TaskType.MOVE, tgt)
      }
      return createTask(TaskType.HALT)
    },
    Pirates: () => {
      {
        const tgt = getShipOfFaction('Civilians')
        if (tgt) {
          return createTask(TaskType.ATTACK, tgt)
        }
        return createTask(TaskType.HALT)
      }
    },
    Police: () => {
      {
        const tgt = getShipOfFaction('Pirates')
        if (tgt) {
          return createTask(TaskType.ATTACK, tgt)
        }
        return createTask(TaskType.HALT)
      }
    },
    AnnoyingFan: () => {
      return createTask(TaskType.FOLLOW, gameState.player.ship)
    },
  }[faction]

  const ship = new Ship({
    gfxID,
    faction,
    stats: {
      maxspeed: new Sylvester.Vector([3, 0]),
      bulletspeed: 10,
      bulletlifetime: 1000,
    },
    positionVec: new Sylvester.Vector([
      Math.random() * 1500 - 750,
      Math.random() * 1500 - 750,
    ]),
    movementVec: new Sylvester.Vector([
      Math.random() * 5 - 1.5,
      Math.random() * 5 - 1.5,
    ]),
  })

  const setNextTask = (event?: any) => {
    let nextTask
    if (
      event &&
      event.data &&
      event.data.task &&
      event.data.task.type === TaskType.HALT
    ) {
      nextTask = createTask(TaskType.IDLE)
    } else {
      nextTask = getNextTask()
    }
    setTimeout(() => {
      ship.subsystems.ai.setTask(nextTask)
    }) // ugh!; race condition. TODO: fix.
  }
  ship.addEventListener('ai_targetLost', setNextTask)
  ship.addEventListener('autopilot_Complete', setNextTask)
  if (faction === 'Civilians') {
    ship.addEventListener('autopilot_Complete', () => {
      ship.subsystems.ai.setTask(getNextTask())
    })
  }
  setTimeout(() => {
    setNextTask()
  }) // wait one tick or else the other ships don't exist yet.
  stage.addChild(ship)
  return ship
}

let numErrorsDisplayed = 0
window.addEventListener('error', e => {
  numErrorsDisplayed += 1
  if (numErrorsDisplayed < 10) {
    NotificationSystem.get().push('error', `ERROR!\n${e.message}`)
  } else if (numErrorsDisplayed === 10) {
    NotificationSystem.get().push('error', `Not displaying any more errors!`)
  }
})

document.addEventListener('DOMContentLoaded', () => {
  // Init createJS
  init()

  // Do misc stuff
  window.miscDebug = miscDebug
  miscDebug.gameState = gameState
  miscDebug.stage = stage
  miscDebug.objectRegistry = ObjectRegistry

  const nqm = new NotyQuestmark(
    readFileSync(__dirname + '/test_qm.md', 'utf-8')
  )
})
