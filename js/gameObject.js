const Stage = require("./stage");
const Sylvester = require("./sylvester-withmods.js");
const _ = require("lodash");

const DEFAULT_OPTIONS = {
    movementVec: new Sylvester.Vector([0, 0]), // Vector decribing current movement
    rotationVec: new Sylvester.Vector([1, 0]), // Vector describing current angle (rotation). Should be a unit vector.
    positionVec: new Sylvester.Vector([0, 0]) // Vector describing current position
};

class GameObject extends createjs.Container {
    constructor(options) {
        options = _.extend({}, DEFAULT_OPTIONS, options);
        super();
        this.movementVec = options.movementVec;
        this.rotationVec = options.rotationVec;
        this.positionVec = options.positionVec;
    };

    destroy() {
        let stage = Stage.get();
        stage.removeChild(this);
        this.dispatchEvent('destroyed');
        this.removeAllEventListeners();
    };

    movementTick(event) {
        this.rotation =
            new Sylvester.Vector([1, 0]).angleTo(this.rotationVec) * 57.2957795 + 90;
        this.positionVec = this.positionVec.add(this.movementVec);
        this.x = this.positionVec.e(1);
        this.y = this.positionVec.e(2);
    };
}

module.exports = GameObject