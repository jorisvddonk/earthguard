import _ from 'lodash'
import ShipSubsystem from '../shipSubsystem'

class FueltanksSubsystem extends ShipSubsystem {
  public fueltanks: Array<{ name: any; capacity: any; content: any }>

  constructor(ship, options) {
    super(ship)
    options = Object.assign(
      {
        name: 'Awesome Fueltank',
        capacity: 500,
        content: 500,
      },
      options
    )
    this.subsystemType = 'fueltanks'
    this.fueltanks = [
      {
        name: options.name,
        capacity: options.capacity,
        content: options.content,
      },
    ]
  }

  public getFuelRemaining() {
    return _.reduce(
      this.fueltanks,
      (memo, fueltank) => {
        return memo + fueltank.content
      },
      0
    )
  }

  public consumeFuel(amount) {
    const fuelTankToUse = _.find(
      this.fueltanks,
      fueltank => fueltank.content > amount
    )
    if (fuelTankToUse != null) {
      fuelTankToUse.content = fuelTankToUse.content - amount
      return true
    } else {
      return false
    }
  }
}

export default FueltanksSubsystem
