const Stage = require("./stage");

class GameObject extends createjs.Container {
    constructor() {
        super();
    }

    destroy() {
        let stage = Stage.get();
        stage.removeChild(this);
        this.dispatchEvent('destroyed');
        this.removeAllEventListeners();
    };
}

module.exports = GameObject