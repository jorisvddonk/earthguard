const Vue = require("vue");
const gameState = require("./gameState");

class StarWidget extends Object {
  constructor(element_selector) {
    super()

    this.vue = new Vue({
      el: element_selector,
      data: { name: "" }
    });

    gameState.on("starChanged", () => {
      this.vue.name = gameState.player.currentstar.name
    });

    if (
      gameState.player.currentstar != undefined &&
      gameState.player.currentstar.name != null
    ) {
      this.vue.name = gameState.player.currentstar.name
    }
  }
};

export default StarWidget;
