import {
  BoxGeometry,
  MeshBasicMaterial
} from '../../lib/three.module.js';
import Entity from './entity.js';
import { Key } from '../platform/keyboard.js';

class Player extends Entity {
  speed = 0.5;
  inertia = 0.8;

  constructor(engine) {
    super(engine);

    this.geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true
    });

    // start kit
    this.level = 1;
    this.kills = this.killsPerStage;

    console.log(this);
  }

  update() {
    super.update();

    this.updateKeyboard();

    const nearest = this.getNearestEntity();
    this.checkKilling(nearest);
  }

  dispose() {
    super.dispose();

    console.info('DEATH')
  }

  move(x, y) {
    super.move(x, y);

    this.engine.camera.position.x = this.position.x;
    this.engine.camera.position.y = this.position.y;

    this.engine.camera.frustumSize = this.engine.defaultZoom + (this.scale.x * this.engine.zoomKillFactor);
    this.engine.resize();
  }

  updateKeyboard() {
    const k = this.engine.keyboard.keys;

    if (k.includes(Key.ARROW_UP) || k.includes(Key.W)) {
      this.movement.y = this.speed;
    }

    if (k.includes(Key.ARROW_LEFT) || k.includes(Key.A)) {
      this.movement.x = -this.speed;
    }

    if (k.includes(Key.ARROW_DOWN) || k.includes(Key.S)) {
      this.movement.y = -this.speed;
    }

    if (k.includes(Key.ARROW_RIGHT) || k.includes(Key.D)) {
      this.movement.x = this.speed;
    }

    // debug
    if (k.includes(Key.SPACE)) {
      this.engine.camera.frustumSize += 1;
      this.engine.resize();
    }

    if (this.engine.keyboard.alt) {
      this.engine.camera.frustumSize -= 1;
      this.engine.resize();
    }
  }
}

export default Player;