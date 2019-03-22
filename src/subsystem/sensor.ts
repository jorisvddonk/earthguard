import ShipSubsystem from '../shipSubsystem'

class SensorSubsystem extends ShipSubsystem {
  constructor(ship, options) {
    super(ship)
    options = Object.assign({}, options)
    this.subsystemType = 'sensor'
    ship.addEventListener('hit', evt => {
      ship.subsystems.memory.push('hit', {
        damage: evt.data.damage,
        perpetrator_objid: evt.data.perpetrator._objid,
      })
    })
  }
}

export default SensorSubsystem
