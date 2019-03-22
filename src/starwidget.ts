import Vue from 'vue'
import gameState from './gameState'

export class StarWidget {
  public vue: any
  constructor(elementSelector) {
    this.vue = new Vue({
      el: elementSelector,
      data: { name: '' },
    })

    gameState.on('starChanged', () => {
      this.vue.name = gameState.player.currentstar.name
    })

    if (
      gameState.player.currentstar !== undefined &&
      gameState.player.currentstar.name != null
    ) {
      this.vue.name = gameState.player.currentstar.name
    }
  }
}
