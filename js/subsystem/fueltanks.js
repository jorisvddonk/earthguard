const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem");

var FueltanksSubsystem = function FueltanksSubsystem() {
  //super():
  ShipSubsystem.call(this);
  var self = this;
  //

  this.subsystemType = "fueltanks";

  this.fueltanks = [{ name: "Awesome Fueltank", capacity: 500, content: 500 }];
};
FueltanksSubsystem.prototype = Object.create(ShipSubsystem.prototype);

FueltanksSubsystem.prototype.tick = function() {
  // todo implement
};

FueltanksSubsystem.prototype.getFuelRemaining = function() {
  return _.reduce(
    this.fueltanks,
    function(memo, fueltank) {
      return memo + fueltank.content;
    },
    0
  );
};

FueltanksSubsystem.prototype.consumeFuel = function(amount) {
  var fuelTankToUse = _.find(this.fueltanks, function(fueltank) {
    return fueltank.content > amount;
  });
  if (fuelTankToUse != null) {
    fuelTankToUse.content = fuelTankToUse.content - amount;
    return true;
  } else {
    return false;
  }
};

module.exports = FueltanksSubsystem;
