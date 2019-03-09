const Vue = require("vue");
const gameState = require("./gameState");

class StarWidget extends Object {
  constructor(element_selector) {
    super()

    this.vue = new Vue({
      el: element_selector,
      data: { name: "" }
    });

    var updateData = (newData) => {
      this.vue.$data.name = newData;
    };

    gameState.on("starChanged", () => {
      updateData(gameState.player.currentstar.name);
    });

    if (
      gameState.player.currentstar != undefined &&
      gameState.player.currentstar.name != null
    ) {
      updateData(gameState.player.currentstar.name);
    }
  }
};

module.exports = StarWidget;
