import Vue from 'vue'
import gameState from './gameState'

export class StarWidget {
  vue: any
  constructor(element_selector) {
    this.vue = new Vue({
      el: element_selector,
      data: { name: '' },
    })

    gameState.on('starChanged', () => {
      this.vue.name = gameState.player.currentstar.name
    })

    if (
      gameState.player.currentstar != undefined &&
      gameState.player.currentstar.name != null
    ) {
      this.vue.name = gameState.player.currentstar.name
    }
  }
}
