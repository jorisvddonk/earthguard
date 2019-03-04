const Vue = require("vue");
const gameState = require("./gameState");
var StarWidget = function StarWidget(element_selector) {
  //super():
  Object.call(this);
  var self = this;

  self.vue = new Vue({
    el: element_selector,
    data: { name: "" }
  });

  var updateData = function(newData) {
    self.vue.$data.name = newData;
  };

  gameState.on("starChanged", function() {
    updateData(gameState.player.currentstar.name);
  });
  if (
    gameState.player.currentstar != undefined &&
    gameState.player.currentstar.name != null
  ) {
    updateData(gameState.player.currentstar.name);
  }
};
StarWidget.prototype = Object.create(Object.prototype);

module.exports = StarWidget;
