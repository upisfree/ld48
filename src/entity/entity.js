import { Mesh, Vector2, Box3 } from '../../lib/three.module.js';
import Player from './player.js';
import lerp from '../math/lerp.js';

class Entity extends Mesh {
  speed = 0.5;
  inertia = 0.8;

  movement = new Vector2(0, 0);

  level = 0;
  kills = 0;
  killsScaleFactor = 0.25;
  killsPerStage = 4;

  constructor(engine) {
    super();

    this.engine = engine;

    this.engine.scene.add(this);
    this.engine.entities.push(this);
  }

  update() {
    this.move(this.movement.x, this.movement.y);

    this.updateBoundingBox();
  }

  updateBoundingBox() {
    if (this.geometry && this.boundingBox === undefined) {
      this.geometry.computeBoundingBox();

      this.boundingBox = new Box3();
    }

    this.boundingBox.copy(this.geometry.boundingBox).applyMatrix4(this.matrixWorld);
  }

  dispose() {
    this.engine.scene.remove(this);

    const entityIndex = this.engine.entities.indexOf(this);
    
    if (entityIndex > -1) {
      this.engine.entities.splice(entityIndex, 1);
    }

    this.geometry.dispose();
    this.material.dispose();
  }

  move(x, y) {
    this.movement.x = lerp(0, x, this.inertia);
    this.movement.y = lerp(0, y, this.inertia);

    this.position.x += this.movement.x;
    this.position.y += this.movement.y;
  }

  getNearestEntity() {
    return this.engine.entities
      .filter(e => e !== this)
      .sort((a, b) => {
        return this.position.distanceTo(a.position) - this.position.distanceTo(b.position);
      })[0];
  }

  isCollidesWithEntity(entity) {
    if (entity === this || entity.boundingBox === undefined) {
      return false;
    }

    return this.boundingBox.intersectsBox(entity.boundingBox);
  }

  // 0. always mesh scale up
  // ?. mesh gravitation?
  // ?. collide box is higher
  // 1. box rotates to 3d 
  // 2. very low detailed sphere 
  // 3. medium detailed sphere 
  // 4. high detailed sphere 
  // 
  // morphs
  // triangle stage?
  // more kills per stage
  updateMeshAfterKill() {
    this.kills++;
    this.level = Math.floor(this.kills / this.killsPerStage);

    const scale = 1 + this.kills * this.killsScaleFactor;
    this.scale.set(scale, scale, scale);
  }

  checkKilling(entity) {
    if (this.isCollidesWithEntity(entity) && !(entity instanceof Player)) {
      if (this.level > entity.level) {
        this.killEntity(entity);
      } else if (this.level < entity.level) {
        this.killedByEntity(entity);
      } else {
        if (Math.random() > 0.5) {
          this.killEntity(entity);
        } else {
          this.killedByEntity(entity);
        }
      }
    }
  }

  killEntity(entity) {
    entity.dispose();
    this.updateMeshAfterKill();
  }

  killedByEntity(entity) {
    this.dispose();
    entity.updateMeshAfterKill();
  }
}

export default Entity;