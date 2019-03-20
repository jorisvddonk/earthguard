let stage;
module.exports = {
  init: () => {
    stage = new createjs.Stage("myCanvas");
  },
  get: () => {
    return stage;
  }
};
