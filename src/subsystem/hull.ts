import _ from 'lodash'
import ShipSubsystem from '../shipSubsystem'

class HullSubsystem extends ShipSubsystem {
  constructor(ship, options) {
    super(ship)
    options = Object.assign(
      {
        maxIntegrity: 1000,
      },
      options
    )
    this.subsystemType = 'hull'
    this.integrity = options.maxIntegrity
    this.maxIntegrity = options.maxIntegrity
    ship.addEventListener('hit', evt => {
      this.takeDamage(evt.data.damage)
    })
  }

  takeDamage(amount) {
    this.integrity -= amount
  }
}

export default HullSubsystem
