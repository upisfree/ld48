import {
  Mesh,
  Vector2,
  Box3,
  Float32BufferAttribute,
  BoxGeometry,
  MeshBasicMaterial,
  MeshNormalMaterial,
  MeshMatcapMaterial,
  MeshLambertMaterial,
  MeshToonMaterial,
  MeshStandardMaterial,
  BackSide,
  FrontSide,
  SphereGeometry
} from '../../lib/three.module.js';
import * as TWEEN from '../../lib/tween.esm.js';
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

  maxScale = 50;

  constructor(engine) {
    super();

    this.geometry = this.createGeometry();
    // this.material = new MeshStandardMaterial({
    // this.material = new MeshToonMaterial({
    this.material = new MeshNormalMaterial({
      // color: 0x0000ff,
      wireframe: true,
      morphTargets: true,
      morphNormals: true,
      // flatShading: true,
      // side: BackSide
    });

    this.updateMorphTargets();

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

  createGeometry() {
    const geometry = new BoxGeometry(1, 1, 1, 32, 32, 32);

    // create an empty array to  hold targets for the attribute we want to morph
    // morphing positions and normals is supported
    geometry.morphAttributes.position = [];

    // the original positions of the cube's vertices
    const positionAttribute = geometry.attributes.position;
    
    // for the first morph target we'll move the cube's vertices onto the surface of a sphere
    const spherePositions = [];

    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);

      spherePositions.push(
        x * Math.sqrt(1 - (y * y / 2) - (z * z / 2) + (y * y * z * z / 3)),
        y * Math.sqrt(1 - (z * z / 2) - (x * x / 2) + (z * z * x * x / 3)),
        z * Math.sqrt(1 - (x * x / 2) - (y * y / 2) + (x * x * y * y / 3))
      );
    }

    // add the spherical positions as the first morph target
    geometry.morphAttributes.position[0] = new Float32BufferAttribute(spherePositions, 3);

    return geometry;
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

  getNearestEntityWithLessKills() {
    return this.engine.entities
      .filter(e => e !== this)
      .sort((a, b) => {
        return a.kills - b.kills;
      })
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

  // VIEW
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
  // more kills per stage – !!!!!!!!!!!
  // gameplay USING SPACE. more aggressive enemies. space usage is limited by timer.
  //   more space between enemies.  – !!!!!!!!!!!
  // sound? 

  // враги убегают от больших чуваков!

  // gameplay first and then is lookis (morphs)
  updateMeshAfterKill() {
    this.kills++;
    this.level = Math.floor(this.kills / this.killsPerStage);

    const scale = 1 + this.kills * this.killsScaleFactor;

    if (scale < this.maxScale) {
      this.scale.set(scale, scale, scale);
    }

    switch (true) {
      case (this.level === 2):
        new TWEEN.Tween(this.rotation)
          .to({ x: Math.PI / 3, y: 0, z: Math.PI / 4 }, 200)
          .easing(TWEEN.Easing.Quadratic.Out)
          .start();

        break;

      case (this.level >= 3 && this.level <= 10):
        // this.morphTargetInfluences[0] = 4.25;
        this.morphTargetInfluences[0] = (this.level - 3) / 2;
        
        // console.log(this.level, this.morphTargetInfluences[0]);

        break;
    }
  }

  checkKilling(entity) {
    if (this.isCollidesWithEntity(entity)) {
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