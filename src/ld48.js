import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Clock,
  LoadingManager,
  TextureLoader,
  AmbientLight,
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
  OrthographicCamera
} from '../lib/three.module.js';
import Keyboard from './platform/keyboard.js';
import Player from './entity/player.js';
import Enemy from './entity/enemy.js';

class LD48 {
  defaultZoom = 50;
  zoomKillFactor = 1.5;

  minEnemiesCount = 10;

  entities = [];
  enemies = [];

  constructor(container) {
    this.container = container;

    this.renderer = new WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true, // TODO: replace with smaa
    });
    this.renderer.outputEncoding = sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.scene.background = new Color(0xdddddd);

    this.clock = new Clock();
    this.camera = new OrthographicCamera(1, 1, 1, 1, 0.0001, 100_000); // 70 fov
    this.camera.frustumSize = this.defaultZoom;

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));

    this.keyboard = new Keyboard();

    this.initLights();

    this.player = new Player(this);

    for (let i = 0; i < 1; i++) {
      this.spawnEnemy();
    }

    this.update();

    console.log(this);
  }

  update(time) {
    requestAnimationFrame(this.update.bind(this));

    const delta = this.clock.getDelta();

    this.player.update();
    this.enemies.forEach(enemy => enemy.update());

    if (this.enemies.length < this.minEnemiesCount) {
      this.spawnEnemy();
    }

    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
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
  }

  initLights() {
    this.ambientLight = new AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);
  }

  spawnEnemy() {
    const enemy = new Enemy(this);
    enemy.position.x = 50 * Math.random() * (Math.random() > 0.5 ? 1 : -1);
    enemy.position.y = 50 * Math.random() * (Math.random() > 0.5 ? 1 : -1);
  }
}

export default LD48;