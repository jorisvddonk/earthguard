import EventEmitter from 'EventEmitter'
import { EventEmitter } from 'events'

class GameState {
  public on: any
  public debugging: { shiplines: boolean }
  public universe: { starmap: any }
  public containers: {
    solarSystem: any
    osd: any
    osd_world: any
    parallax: any
  }
  public player: { currentstar: any; ship: any; selectedShip: any }
  private ee: EventEmitter
  constructor() {
    this.ee = new EventEmitter()
    this.player = new Proxy(
      {
        currentstar: null,
        ship: null,
        selectedShip: null,
      },
      {
        set: (obj, prop, value) => {
          obj[prop] = value
          if (prop === 'currentstar') {
            this.ee.emit('starChanged')
          }
          if (prop === 'selectedShip') {
            this.ee.emit('shipChanged')
          }
          return true
        },
      }
    )
    this.containers = {
      solarSystem: null,
      osd: null,
      osd_world: null,
      parallax: null,
    }
    this.universe = {
      starmap: null,
    }
    this.debugging = {
      shiplines: false,
    }

    this.on = this.ee.on.bind(this.ee)
  }
}

const gameState = new GameState()

export default gameState
