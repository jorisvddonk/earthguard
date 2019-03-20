let stage;
export default {
  init: () => {
    stage = new createjs.Stage("myCanvas");
  },
  get: () => {
    return stage;
  }
};
