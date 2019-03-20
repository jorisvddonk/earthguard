class ShipSubsystem {
  ship: any;
  subsystemType: string;
  constructor(ship) {
    this.ship = ship;
    this.subsystemType = "genericSubsystem";
  }
};

export default ShipSubsystem;
