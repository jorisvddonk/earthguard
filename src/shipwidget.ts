import Vue from 'vue'
import gameState from './gameState'

export class ShipWidget {
  public vue: any
  constructor(elementSelector) {
    this.vue = new Vue({
      el: elementSelector,
      data: { ship: null },
    })

    gameState.on('shipChanged', () => {
      this.vue.ship = gameState.player.selectedShip
    })

    if (
      gameState.player.selectedShip !== undefined &&
      gameState.player.selectedShip !== null
    ) {
      this.vue.ship = gameState.player.selectedShip
    }
  }
}
