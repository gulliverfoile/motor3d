// ============================================
// forward/index.js - Renderizador 3D Forward
// Módulo que implementa el puerto de renderizado 3D
// ============================================

import { core } from '../../core.js';

// Shaders corregidos con posición en espacio de mundo
const VERT_SRC = `#version 300 es
precision highp float;
in vec3 a_position;
in vec3 a_normal;
in vec2 a_texcoord;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
out vec3 v_normal;
out vec2 v_texcoord;
out vec3 v_worldPos;
void main() {
    mat4 modelView = u_viewMatrix * u_modelMatrix;
    v_normal = normalize(mat3(transpose(inverse(modelView))) * a_normal);
    v_texcoord = a_texcoord;
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    gl_Position = u_projectionMatrix * modelView * vec4(a_position, 1.0);
}`;

const FRAG_SRC = `#version 300 es
precision highp float;
in vec3 v_normal;
in vec2 v_texcoord;
in vec3 v_worldPos;
uniform vec3 u_lightPos;
uniform vec3 u_viewPos;
uniform vec3 u_lightColor;
uniform vec3 u_objectColor;
uniform float u_ambientStrength;
uniform float u_specularStrength;
uniform float u_shininess;
out vec4 fragColor;
void main() {
    vec3 ambient = u_ambientStrength * u_lightColor;
    vec3 norm = normalize(v_normal);
    vec3 lightDir = normalize(u_lightPos - v_worldPos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * u_lightColor;
    vec3 viewDir = normalize(u_viewPos - v_worldPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_shininess);
    vec3 specular = u_specularStrength * spec * u_lightColor;
    vec3 result = (ambient + diffuse + specular) * u_objectColor;
    fragColor = vec4(result, 1.0);
}`;

export const forwardRenderer = {
  enabled: true,
  program: null,
  uniforms: {},
  cubeVAO: null,
  cubeIndexCount: 0,

  init(core) {
    if (!core.gfx || !core.gl) {
      console.error('❌ gfxManager no inicializado');
      this.enabled = false;
      return;
    }
    
    const gl = core.gl;
    
    // Compilar shaders y crear programa
    try {
      this.program = core.gfx.createProgram(VERT_SRC, FRAG_SRC);
      console.log('✅ Programa shader creado');
    } catch (e) {
      console.error('❌ Error creando shaders:', e);
      this.enabled = false;
      return;
    }
    
    // Obtener ubicaciones de uniformes
    this.uniforms = {
      modelMatrix: gl.getUniformLocation(this.program, 'u_modelMatrix'),
      viewMatrix: gl.getUniformLocation(this.program, 'u_viewMatrix'),
      projectionMatrix: gl.getUniformLocation(this.program, 'u_projectionMatrix'),
      lightPos: gl.getUniformLocation(this.program, 'u_lightPos'),
      viewPos: gl.getUniformLocation(this.program, 'u_viewPos'),
      lightColor: gl.getUniformLocation(this.program, 'u_lightColor'),
      objectColor: gl.getUniformLocation(this.program, 'u_objectColor'),
      ambientStrength: gl.getUniformLocation(this.program, 'u_ambientStrength'),
      specularStrength: gl.getUniformLocation(this.program, 'u_specularStrength'),
      shininess: gl.getUniformLocation(this.program, 'u_shininess')
    };
    
    // Crear geometría de cubo de ejemplo
    this._createCube();
    console.log('✅ forwardRenderer inicializado');
  },

  _createCube() {
    const gl = core.gl;
    // Vértices de un cubo (posición, normal, texcoord)
    const vertices = [
      // Cara frontal
      -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0, 0.0,
       0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  1.0, 0.0,
       0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0, 1.0,
      -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  0.0, 1.0,
      // Cara trasera
       0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 0.0,
      -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 0.0,
      -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 1.0,
       0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 1.0,
      // Cara superior
      -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0, 0.0,
       0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0, 0.0,
       0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0, 1.0,
      -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0, 1.0,
      // Cara inferior
      -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0, 0.0,
       0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0, 0.0,
       0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0, 1.0,
      -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0, 1.0,
      // Cara derecha
       0.5, -0.5,  0.5,  1.0,  0.0,  0.0,  0.0, 0.0,
       0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  1.0, 0.0,
       0.5,  0.5, -0.5,  1.0,  0.0,  0.0,  1.0, 1.0,
       0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  0.0, 1.0,
      // Cara izquierda
      -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0, 0.0,
      -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,  1.0, 0.0,
      -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0, 1.0,
      -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,  0.0, 1.0
    ];
    
    const indices = [
       0,  1,  2,  0,  2,  3,  // frontal
       4,  5,  6,  4,  6,  7,  // trasera
       8,  9, 10,  8, 10, 11,  // superior
      12, 13, 14, 12, 14, 15,  // inferior
      16, 17, 18, 16, 18, 19,  // derecha
      20, 21, 22, 20, 22, 23   // izquierda
    ];
    
    const vertexBuffer = core.gfx.createBuffer(vertices);
    const indexBuffer = core.gfx.createIndexBuffer(indices);
    
    this.cubeVAO = core.gfx.createVAO([
      { buffer: vertexBuffer, location: 0, size: 3, stride: 8 * Float32Array.BYTES_PER_ELEMENT, offset: 0 },
      { buffer: vertexBuffer, location: 1, size: 3, stride: 8 * Float32Array.BYTES_PER_ELEMENT, offset: 3 * Float32Array.BYTES_PER_ELEMENT },
      { buffer: vertexBuffer, location: 2, size: 2, stride: 8 * Float32Array.BYTES_PER_ELEMENT, offset: 6 * Float32Array.BYTES_PER_ELEMENT },
      { indexBuffer: indexBuffer }
    ]);
    this.cubeIndexCount = indices.length;
  },

  draw(gl, delta) {
    if (!this.enabled || !this.program) return;
    
    // Limpiar pantalla
    core.gfx.setClearColor(0.1, 0.1, 0.15, 1.0);
    core.gfx.clear();
    
    gl.useProgram(this.program);
    
    // Obtener matrices de la cámara (si existe)
    const camera = core.modules['camera'];
    let viewMatrix = new Float32Array(16);
    let projMatrix = new Float32Array(16);
    let viewPos = [0, 0, 5];
    
    if (camera?.enabled) {
      viewMatrix = camera.getViewMatrix();
      projMatrix = camera.getProjectionMatrix();
      viewPos = camera.position || viewPos;
    } else {
      // Matrices por defecto si no hay cámara
      viewMatrix = this._lookAt([0, 0, 3], [0, 0, 0], [0, 1, 0]);
      projMatrix = this._perspective(45 * Math.PI / 180, core.canvas.width / core.canvas.height, 0.1, 100);
    }
    
    // Matriz de modelo: identidad con rotación en Y
    const modelMatrix = this._createIdentity();
    const angle = performance.now() * 0.001;
    this._rotateY(modelMatrix, angle);
    
    // Pasar uniformes
    gl.uniformMatrix4fv(this.uniforms.modelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(this.uniforms.viewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(this.uniforms.projectionMatrix, false, projMatrix);
    
    // Luz fija
    gl.uniform3fv(this.uniforms.lightPos, [2, 3, 2]);
    gl.uniform3fv(this.uniforms.viewPos, viewPos);
    gl.uniform3fv(this.uniforms.lightColor, [1, 1, 1]);
    gl.uniform3fv(this.uniforms.objectColor, [0.2, 0.5, 0.8]);
    gl.uniform1f(this.uniforms.ambientStrength, 0.2);
    gl.uniform1f(this.uniforms.specularStrength, 0.5);
    gl.uniform1f(this.uniforms.shininess, 32);
    
    // Dibujar cubo
    gl.bindVertexArray(this.cubeVAO);
    gl.drawElements(gl.TRIANGLES, this.cubeIndexCount, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  },

  // Funciones matemáticas auxiliares (evitan dependencia externa)
  _createIdentity() {
    return new Float32Array([
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
    ]);
  },

  _lookAt(eye, center, up) {
    const z = [eye[0]-center[0], eye[1]-center[1], eye[2]-center[2]];
    const lenZ = Math.sqrt(z[0]*z[0]+z[1]*z[1]+z[2]*z[2]);
    z[0]/=lenZ; z[1]/=lenZ; z[2]/=lenZ;
    const x = [up[1]*z[2]-up[2]*z[1], up[2]*z[0]-up[0]*z[2], up[0]*z[1]-up[1]*z[0]];
    const lenX = Math.sqrt(x[0]*x[0]+x[1]*x[1]+x[2]*x[2]);
    x[0]/=lenX; x[1]/=lenX; x[2]/=lenX;
    const y = [z[1]*x[2]-z[2]*x[1], z[2]*x[0]-z[0]*x[2], z[0]*x[1]-z[1]*x[0]];
    return new Float32Array([
      x[0], y[0], z[0], 0,
      x[1], y[1], z[1], 0,
      x[2], y[2], z[2], 0,
      -(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),
      -(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),
      -(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]),
      1
    ]);
  },
  
  _perspective(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov/2);
    const nf = 1/(near-far);
    return new Float32Array([
      f/aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far+near)*nf, -1,
      0, 0, (2*far*near)*nf, 0
    ]);
  },
  
  _rotateY(matrix, angle) {
    const s = Math.sin(angle), c = Math.cos(angle);
    matrix[0] = c; matrix[2] = s; matrix[8] = -s; matrix[10] = c;
    matrix[5] = 1; matrix[15] = 1;
    // Mantener la diagonal correcta (matrix[0], [5], [10], [15] ya están fijados)
  }
};
