class ShipSubsystem {
  public ship: any
  public subsystemType: string
  constructor(ship) {
    this.ship = ship
    this.subsystemType = 'genericSubsystem'
  }
}

export default ShipSubsystem
