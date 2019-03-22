import { MemoryReader } from './memoryReader'

class ShipSubsystem {
  public ship: any
  public subsystemType: string
  protected memoryReader: MemoryReader
  constructor(ship) {
    this.ship = ship
    this.subsystemType = 'genericSubsystem'
    this.memoryReader = null
  }

  public tick() {
    if (this.memoryReader) {
      this.memoryReader.tick()
    }
  }
}

export default ShipSubsystem
