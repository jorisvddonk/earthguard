import Sylvester from '../sylvester-withmods';
const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem").default;

class EngineSubsystem extends ShipSubsystem {
    constructor(ship, options) {
        super(ship);
        options = Object.assign({
            power: 0.04,
            canReverse: true,
        }, options);
        this.subsystemType = "engine";
        this.power = options.power;
        this.canReverse = options.canReverse;
        this.thrustVector = new Sylvester.Vector([this.power, 0]);
    }
};

export default EngineSubsystem;
