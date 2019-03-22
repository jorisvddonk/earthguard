import Ship from './ship'
import MemorySubsystem from './subsystem/memory'

export class MemoryReader {
  private ship: Ship
  private memory: MemorySubsystem
  private callbackFunctions: any
  private newestIndexRead: number
  constructor(ship: Ship, callbackFunctions, options?) {
    if (!(ship instanceof Ship)) {
      throw new Error('cannot initialize memoryReader: ship is not a Ship!')
    }
    this.ship = ship
    this.memory = null
    this.callbackFunctions = callbackFunctions
    this.newestIndexRead = -1
  }

  public tick() {
    if (!this.memory) {
      this.memory = this.ship.subsystems.memory
      return
    }
    if (this.newestIndexRead < this.memory.getNewestIndex()) {
      this.memory.readRange(
        this.newestIndexRead,
        this.memory.getNewestIndex(),
        (index, message) => {
          this.newestIndexRead = index
          if (this.callbackFunctions.hasOwnProperty(message.type)) {
            this.callbackFunctions[message.type](message.data)
          }
        }
      )
    }
  }
}
