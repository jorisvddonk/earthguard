const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem");

class FueltanksSubsystem extends ShipSubsystem {
  constructor(ship, options) {
    super()
    options = Object.assign({
      name: "Awesome Fueltank",
      capacity: 500,
      content: 500
    }, options);
    this.subsystemType = "fueltanks";
    this.fueltanks = [{ name: options.name, capacity: options.capacity, content: options.content }];
  }

  tick() {
    // todo implement
  };

  getFuelRemaining() {
    return _.reduce(
      this.fueltanks,
      function (memo, fueltank) {
        return memo + fueltank.content;
      },
      0
    );
  };

  consumeFuel(amount) {
    const fuelTankToUse = _.find(this.fueltanks, function (fueltank) {
      return fueltank.content > amount;
    });
    if (fuelTankToUse != null) {
      fuelTankToUse.content = fuelTankToUse.content - amount;
      return true;
    } else {
      return false;
    }
  };

};

module.exports = FueltanksSubsystem;
