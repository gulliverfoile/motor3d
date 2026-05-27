// ============================================
// gfx-manager.js - Servicio de gráficos 3D
// Maneja contexto WebGL, shaders, buffers, texturas
// ============================================

export const gfxManager = {
  core: null,
  gl: null,
  shaders: {},
  meshes: {},
  textures: {},

  init(core) {
    this.core = core;
    this.gl = core.gl;
    if (!this.gl) {
      console.error('❌ WebGL no disponible');
      return;
    }
    
    // Configuración inicial de WebGL
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);
    
    console.log('✅ gfxManager inicializado');
  },

  // Compilar un shader desde fuente
  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Error compilando shader: ${info}`);
    }
    return shader;
  },

  // Crear un programa (vertex + fragment)
  createProgram(vertSource, fragSource) {
    const gl = this.gl;
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragSource);
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Error enlazando programa: ${info}`);
    }
    
    // Los shaders individuales ya no se necesitan
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    
    return program;
  },

  // Crear un buffer de vértices
  createBuffer(data, usage = null) {
    const gl = this.gl;
    if (!usage) usage = gl.STATIC_DRAW;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return buffer;
  },

  // Crear un buffer de índices
  createIndexBuffer(data) {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return buffer;
  },

  // Crear un Vertex Array Object (VAO) con una configuración dada
  createVAO(attributes) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    
    for (const attr of attributes) {
      gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
      gl.enableVertexAttribArray(attr.location);
      gl.vertexAttribPointer(
        attr.location,
        attr.size,
        attr.type || gl.FLOAT,
        attr.normalized || false,
        attr.stride || 0,
        attr.offset || 0
      );
    }
    
    if (attributes.indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, attributes.indexBuffer);
    }
    
    gl.bindVertexArray(null);
    return vao;
  },

  // Establecer color de fondo
  setClearColor(r, g, b, a) {
    this.gl.clearColor(r, g, b, a);
  },

  // Limpiar pantalla
  clear() {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
};
