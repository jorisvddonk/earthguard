import _ from 'lodash'
import ShipSubsystem from '../shipSubsystem'

class FueltanksSubsystem extends ShipSubsystem {
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
      function(memo, fueltank) {
        return memo + fueltank.content
      },
      0
    )
  }

  public consumeFuel(amount) {
    const fuelTankToUse = _.find(this.fueltanks, function(fueltank) {
      return fueltank.content > amount
    })
    if (fuelTankToUse != null) {
      fuelTankToUse.content = fuelTankToUse.content - amount
      return true
    } else {
      return false
    }
  }
}

export default FueltanksSubsystem
