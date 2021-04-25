import {
  BoxGeometry,
  MeshBasicMaterial
} from '../../lib/three.module.js';
import * as TWEEN from '../../lib/tween.esm.js';
import Entity from './entity.js';
import Player from './player.js';

class Enemy extends Entity {
  speed = 0.1;
  inertia = 0.8;

  constructor(engine) {
    super(engine);

    // console.log(this);

    this.engine.enemies.push(this);
  }

  update() {
    super.update();

    this.updateAI();
  }

  updateAI() {
    const nearest = this.getNearestEntity();
    const angle = Math.atan2(nearest.position.y - this.position.y, nearest.position.x - this.position.x);

    new TWEEN.Tween(this.rotation)
      .to({ z: angle }, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start();

    this.position.x += this.speed * Math.cos(angle);
    this.position.y += this.speed * Math.sin(angle);

    this.checkKilling(nearest);
  }

  dispose() {
    super.dispose();

    const enemyIndex = this.engine.enemies.indexOf(this);
    
    if (enemyIndex > -1) {
      this.engine.enemies.splice(enemyIndex, 1);
    }
  }
}

export default Enemy;