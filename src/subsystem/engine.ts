import _ from 'lodash'
import ShipSubsystem from '../shipSubsystem'
import Sylvester from '../sylvester-withmods'

class EngineSubsystem extends ShipSubsystem {
  public canReverse: boolean
  public thrustVector: any
  public power: number

  constructor(ship, options) {
    super(ship)
    options = Object.assign(
      {
        power: 0.04,
        canReverse: true,
      },
      options
    )
    this.subsystemType = 'engine'
    this.power = options.power
    this.canReverse = options.canReverse
    this.thrustVector = new Sylvester.Vector([this.power, 0])
  }
}

export default EngineSubsystem
