var Keyboard = {
    keys : {},
    keyPress : function (evt) {
        if (this.keys[evt.keyCode] > 0) { return; }
        this.keys[evt.keyCode] = evt.timeStamp || (new Date()).getTime();
    },
    keyRelease : function (evt) {
        this.keys[evt.keyCode] = 0;
    },
    isPressed: function(keycode) {
    	return this.keys.hasOwnProperty(keycode) && this.keys[keycode] > 0;
    }
};
window.addEventListener("keydown", Keyboard.keyPress.bind(Keyboard));
window.addEventListener("keyup", Keyboard.keyRelease.bind(Keyboard));