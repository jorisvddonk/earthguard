const Keyboard = {
  keys: {},
  keyPress(evt) {
    if (this.keys[evt.keyCode] > 0) {
      return
    }
    this.keys[evt.keyCode] = evt.timeStamp || new Date().getTime()
  },
  keyRelease(evt) {
    this.keys[evt.keyCode] = 0
  },
  isPressed(keycode) {
    return this.keys.hasOwnProperty(keycode) && this.keys[keycode] > 0
  },
  onKeyDown(keycode, callback) {
    window.addEventListener('keydown', evt => {
      if (evt.keyCode == keycode) {
        callback(evt)
      }
    })
  },
}
window.addEventListener('keydown', Keyboard.keyPress.bind(Keyboard))
window.addEventListener('keyup', Keyboard.keyRelease.bind(Keyboard))
export default Keyboard
