define('shipSubsystem', [], function(){
  var ShipSubsystem = function ShipSubsystem() {
    //super():
    Object.call(this);
    var self = this;
    //

    this.subsystemType = "genericSubsystem";
  };
  ShipSubsystem.prototype = Object.create(Object.prototype);

  ShipSubsystem.prototype.tick = function() {
    // todo subclasses implement
  };

  return ShipSubsystem;
});