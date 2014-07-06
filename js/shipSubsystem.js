define('shipSubsystem', [], function(){
  var ShipSubsystem = function ShipSubsystem(element_selector) {
    //super():
    Object.call(this);
    var self = this;
    //

    this.SubsystemType = "genericSubsystem";
  };
  ShipSubsystem.prototype = Object.create(Object.prototype);

  ShipSubsystem.prototype.tick = function() {
    // todo subclasses implement
  };

  return ShipSubsystem;
});