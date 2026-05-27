// ============================================
// camera/index.js - Módulo de cámara 3D
// Controla posición y orientación, genera matrices
// ============================================

export const cameraModule = {
  enabled: true,
  position: [0, 0, 5],
  target: [0, 0, 0],
  up: [0, 1, 0],
  fov: 45 * Math.PI / 180,
  near: 0.1,
  far: 100.0,
  
  init(core) {
    console.log('📷 Módulo de cámara inicializado');
  },
  
  update(delta, controls) {
    // Movimiento simple con teclas (si hay controles)
    if (controls && controls.isPressed) {
      const speed = 5 * delta / 1000;
      if (controls.isPressed('KeyW')) this.position[2] -= speed;
      if (controls.isPressed('KeyS')) this.position[2] += speed;
      if (controls.isPressed('KeyA')) this.position[0] -= speed;
      if (controls.isPressed('KeyD')) this.position[0] += speed;
    }
  },
  
  getViewMatrix() {
    // Calcula la matriz de vista lookAt
    const z = [
      this.position[0] - this.target[0],
      this.position[1] - this.target[1],
      this.position[2] - this.target[2]
    ];
    const lenZ = Math.sqrt(z[0]*z[0]+z[1]*z[1]+z[2]*z[2]);
    z[0] /= lenZ; z[1] /= lenZ; z[2] /= lenZ;
    
    const x = [
      this.up[1]*z[2] - this.up[2]*z[1],
      this.up[2]*z[0] - this.up[0]*z[2],
      this.up[0]*z[1] - this.up[1]*z[0]
    ];
    const lenX = Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);
    x[0] /= lenX; x[1] /= lenX; x[2] /= lenX;
    
    const y = [
      z[1]*x[2] - z[2]*x[1],
      z[2]*x[0] - z[0]*x[2],
      z[0]*x[1] - z[1]*x[0]
    ];
    
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -(x[0]*this.position[0]+x[1]*this.position[1]+x[2]*this.position[2]),
      -(y[0]*this.position[0]+y[1]*this.position[1]+y[2]*this.position[2]),
      -(z[0]*this.position[0]+z[1]*this.position[1]+z[2]*this.position[2]),
      1
    ]);
  },
  
  getProjectionMatrix() {
    const aspect = core.canvas ? core.canvas.width / core.canvas.height : 1;
    const f = 1.0 / Math.tan(this.fov/2);
    const nf = 1/(this.near - this.far);
    return new Float32Array([
      f/aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (this.far+this.near)*nf, -1,
      0, 0, (2*this.far*this.near)*nf, 0
    ]);
  }
};
