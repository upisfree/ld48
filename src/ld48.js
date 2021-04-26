import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Clock,
  LoadingManager,
  TextureLoader,
  AmbientLight,
  DirectionalLight,
  Color,
  EventDispatcher,
  Vector3,
  Group,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  PMREMGenerator,
  UnsignedByteType,
  sRGBEncoding,
  OrthographicCamera,
  HalfFloatType
} from '../lib/three.module.js';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  BloomEffect,
  NoiseEffect,
  BlendFunction,
  HueSaturationEffect
} from '../lib/postprocessing.esm.js';
import * as TWEEN from '../lib/tween.esm.js';
import Keyboard from './platform/keyboard.js';
import Player from './entity/player.js';
import Enemy from './entity/enemy.js';

class LD48 {
  defaultZoom = 20;
  zoomKillFactor = 1.5;

  minEnemiesCount = 100;

  entities = [];
  enemies = [];

  constructor(container, victorySign, killedSign) {
    this.container = container;
    this.victorySign = victorySign;
    this.killedSign = killedSign;

    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
      // antialias: true, // TODO: replace with smaa
      antialias: false,
      stencil: false,
      depth: false,
      logarithmicDepthBuffer: true
    });
    this.renderer.outputEncoding = sRGBEncoding;

    this.composer = new EffectComposer(this.renderer, {
      frameBufferType: HalfFloatType
    });

    this.container.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.scene.background = new Color(0xdddddd);

    this.clock = new Clock();
    this.camera = new OrthographicCamera(1, 1, 1, 1, 0.0001, 100_000_000_00); // 70 fov
    this.camera.frustumSize = this.defaultZoom;

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));

    this.keyboard = new Keyboard();
    this.initPostEffects();

    this.initLights();

    this.player = new Player(this);

    for (let i = 0; i < this.minEnemiesCount; i++) {
      this.spawnEnemy();
    }

    this.update();

    console.log(this);
  }

  update(time) {
    requestAnimationFrame(this.update.bind(this));

    const delta = this.clock.getDelta();

    TWEEN.update(time);

    this.player.update();
    this.enemies.forEach(enemy => enemy.update());

    if (this.enemies.length < this.minEnemiesCount) {
      this.spawnEnemy();
    }

    this.render(delta);
  }

  render(delta) {
    this.composer.render(delta);
    // this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.containerBounds = this.container.getBoundingClientRect();

    this.camera.aspect = this.containerBounds.width / this.containerBounds.height;
    
    this.camera.left = -0.5 * this.camera.frustumSize * this.camera.aspect;
    this.camera.right = 0.5 * this.camera.frustumSize * this.camera.aspect;
    this.camera.top = this.camera.frustumSize / 2;
    this.camera.bottom = -this.camera.frustumSize / 2;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.containerBounds.width, this.containerBounds.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    this.composer.setSize(this.containerBounds.width, this.containerBounds.height);
  }

  initLights() {
    this.ambientLight = new AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);

    this.directionalLight = new DirectionalLight(0xff00ff, 1);
    this.directionalLight.position.z = -1;
    this.scene.add(this.directionalLight);
  }

  spawnEnemy() {
    const enemy = new Enemy(this);
    enemy.position.x = 50 * Math.random() * (Math.random() > 0.5 ? 1 : -1);
    enemy.position.y = 50 * Math.random() * (Math.random() > 0.5 ? 1 : -1);
  }

  initPostEffects() {
    const noise = new EffectPass(this.camera, new NoiseEffect({
      premultiply: true,
      blendFunction: BlendFunction.REFLECT
    }));

    const saturation = new EffectPass(this.camera, new HueSaturationEffect({
      saturation: -1
    }));

    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(noise);
    this.composer.addPass(saturation);
    // this.composer.addPass(new EffectPass(this.camera, new BloomEffect()));

    console.log(new EffectPass(this.camera, new NoiseEffect()).effects[0]);
  }
}

export default LD48;