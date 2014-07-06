define('starwidget', [], function(){
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

    var observer = new PathObserver(gameState, 'player.currentstar.name');
    observer.open(function(newValue, oldValue) {
      updateData(newValue);
    });
    if (gameState.player.currentstar != undefined && gameState.player.currentstar.name != null) {
      updateData(gameState.player.currentstar.name);
    }
  };
  StarWidget.prototype = Object.create(Object.prototype);

  return StarWidget;
});