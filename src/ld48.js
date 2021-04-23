class LD48 {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.containerBounds = this.container.getBoundingClientRect();
    this.gl = this.canvas.getContext('2d');

    this.container.append(this.canvas);

    this.resize();
    this.update();

    window.addEventListener('resize', this.resize.bind(this));
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    this.render();
  }

  render() {
    console.log('f');
  }

  resize() {
    this.containerBounds = this.container.getBoundingClientRect();
    
    this.canvas.width = this.containerBounds.width;
    this.canvas.height = this.containerBounds.height;
  }
}

export default LD48;