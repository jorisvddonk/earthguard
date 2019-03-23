import ShipSubsystem from '../shipSubsystem'
import { MessageType } from './memory'

class SensorSubsystem extends ShipSubsystem {
  constructor(ship, options) {
    super(ship)
    options = Object.assign({}, options)
    this.subsystemType = 'sensor'
    ship.addEventListener('hit', evt => {
      ship.subsystems.memory.push(MessageType.TAKEN_DAMAGE, {
        damage: evt.data.damage,
        perpetrator_objid: evt.data.perpetrator._objid,
      })
    })
  }
}

export default SensorSubsystem
