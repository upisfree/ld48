const Key = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  ARROW_UP: 38,
  ARROW_LEFT: 37,
  ARROW_DOWN: 40,
  ARROW_RIGHT: 39,
  SPACE: 32
};

class Keyboard {
  constructor() {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    this.keys = [];

    this.alt = null;
    this.ctrl = null;
    this.meta = null;
    this.shift = null;
  }

  onKeyDown(event) {
    if (this.keys.includes(event.keyCode) === false) {
      this.keys.push(event.keyCode);
    }

    this.alt = event.altKey;
    this.ctrl = event.ctrlKey;
    this.meta = event.metaKey;
    this.shift = event.shiftKey;
  }

  onKeyUp(event) {
    const keyIndex = this.keys.indexOf(event.keyCode);

    if (keyIndex > -1) {
      this.keys.splice(keyIndex, 1);
    }

    this.alt = event.altKey;
    this.ctrl = event.ctrlKey;
    this.meta = event.metaKey;
    this.shift = event.shiftKey;
  }
}

export {
  Keyboard as default,
  Key
};