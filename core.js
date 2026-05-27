// ============================================
// core.js - Núcleo del motor (eventos, módulos, servicios)
// Versión adaptada para soporte 2D/3D
// ============================================

export const core = {
  canvas: null,
  ctx: null,        // Contexto 2D (para renderizadores 2D)
  gl: null,         // Contexto WebGL (para renderizadores 3D)
  logElement: null,
  modules: {},
  currentModule: null,
  currentModuleObj: null,
  nextModule: null,
  moduleParams: {},
  events: {},
  running: true,
  lastTimestamp: 0,
  _updatingUI: false,

  // Servicios (se inicializan según necesidad)
  assets: null,
  audio: null,
  data: null,
  i18n: null,
  scene: null,
  controls: null,
  gfx: null,        // Servicio gráfico 3D (gfxManager)

  init(canvasId, logId) {
    console.log('🟢 Inicializando core...');
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('❌ Canvas no encontrado');
      return;
    }
    // Contexto 2D (para compatibilidad con módulos 2D)
    this.ctx = this.canvas.getContext('2d');
    
    // Intentar obtener contexto WebGL2 (para 3D)
    this.gl = this.canvas.getContext('webgl2', { 
      alpha: false, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    if (!this.gl) {
      console.warn('⚠️ WebGL2 no disponible, solo se podrá usar renderizado 2D');
    } else {
      console.log('✅ Contexto WebGL2 obtenido');
    }

    this.logElement = document.getElementById(logId);
    this.running = true;
    
    // El bucle se inicia después de registrar módulos en main.js
    requestAnimationFrame((t) => this.loop(t));
    console.log('✅ Core inicializado');
  },

  // Sistema de eventos (sin cambios)
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  },

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  },

  // Registro de módulos (sin cambios)
  registerModule(name, moduleObj) {
    this.modules[name] = moduleObj;
    if (moduleObj.init) moduleObj.init(this);
    console.log(`📦 Módulo registrado: ${name}`);
  },

  switchModule(name, params = {}) {
    if (!this.modules[name]) {
      console.error(`❌ Módulo ${name} no registrado`);
      return;
    }
    if (this.currentModule) {
      const old = this.modules[this.currentModule];
      if (old.onExit) old.onExit();
    }
    this.nextModule = name;
    this.moduleParams = params;
  },

  // Bucle principal (adaptado para 2D/3D)
  loop(timestamp) {
    if (!this.running) {
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    const delta = Math.min(100, timestamp - this.lastTimestamp);
    this.lastTimestamp = timestamp;

    // Cambio de módulo pendiente
    if (this.nextModule) {
      this.currentModule = this.nextModule;
      this.currentModuleObj = this.modules[this.currentModule];
      if (this.currentModuleObj.onEnter) {
        this.currentModuleObj.onEnter(this.moduleParams);
      }
      this.nextModule = null;
      this.moduleParams = {};
    }

    // Actualizar módulo actual (lógica)
    if (this.currentModuleObj?.update) {
      this.currentModuleObj.update(delta, this.controls);
    }

    // Limpiar pantalla según el contexto activo
    if (this.gl) {
      // Si hay renderizador 3D, él se encarga de limpiar
      const renderer3D = this.modules['renderer-forward'];
      if (renderer3D?.enabled) {
        renderer3D.draw(this.gl, delta);
      }
    } else if (this.ctx) {
      // Fallback 2D
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const renderer2D = Object.values(this.modules).find(
        m => m.enabled && (m === this.modules['renderer-sprites'] || m === this.modules['renderer-ascii'])
      );
      if (renderer2D) renderer2D.draw(this.ctx);
    }

    // Actualizar controles (si existen)
    if (this.controls) this.controls.update();

    requestAnimationFrame((t) => this.loop(t));
  },

  // Utilidades
  log(msg, type = 'info') {
    if (!this.logElement) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = msg;
    this.logElement.appendChild(entry);
    this.logElement.scrollTop = this.logElement.scrollHeight;
    if (this.logElement.children.length > 50) {
      this.logElement.removeChild(this.logElement.firstChild);
    }
  },

  getPlayer() {
    return this.currentModuleObj?.player;
  },

  updateUI(player) {
    if (this._updatingUI) return;
    this._updatingUI = true;
    if (player) this.emit('player:updated', player);
    this._updatingUI = false;
  }
};