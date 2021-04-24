import {
  BoxGeometry,
  MeshBasicMaterial
} from '../../lib/three.module.js';
import Entity from './entity.js';
import Player from './player.js';

class Enemy extends Entity {
  speed = 0.01;
  // speed = 0.1;
  inertia = 0.8;

  constructor(engine) {
    super(engine);

    this.geometry = new BoxGeometry(1, 1, 1);
    this.material = new MeshBasicMaterial({
      color: 0x0000ff,
      wireframe: true
    });

    // console.log(this);

    this.engine.enemies.push(this);
  }

  update() {
    super.update();

    this.updateAI();
  }

  updateAI() {
    const nearest = this.getNearestEntity();
    // const nearest = this.engine.player;
    const angle = Math.atan2(nearest.position.y - this.position.y, nearest.position.x - this.position.x);

    this.rotation.z = angle;

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