const EventEmitter = require("EventEmitter").default;
const ee = new EventEmitter();
const gameState = {
  player: new Proxy(
    {
      currentstar: null,
      ship: null
    },
    {
      set: (obj, prop, value) => {
        obj[prop] = value;
        if (prop === "currentstar") {
          ee.emit("starChanged");
        }
        return true;
      }
    }
  ),
  containers: {
    solarSystem: null,
    osd: null,
    osd_world: null,
    parallax: null
  },
  universe: {
    ships: [],
    starmap: null
  },
  debugging: {
    shiplines: false
  },
  bullets: [],
  on: ee.on.bind(ee)
};
module.exports = gameState;
