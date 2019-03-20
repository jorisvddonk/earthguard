const ShipSubsystem = require('../shipSubsystem').default

class SensorSubsystem extends ShipSubsystem {
  constructor(ship, options) {
    super(ship)
    options = Object.assign({}, options)
    this.subsystemType = 'sensor'
    ship.addEventListener('hit', evt => {
      ship.subsystems.memory.push('hit', {
        damage: evt.data.damage,
        perpetrator: evt.data.perpetrator,
      })
    })
  }
}

export default SensorSubsystem
