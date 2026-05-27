// ============================================
// physics-world/index.js - Sistema de físicas
// Por ahora es un placeholder que emite eventos de prueba
// ============================================

export const physicsWorld = {
  enabled: false, // Se activará cuando haya objetos físicos
  objetos: [],
  
  init(core) {
    console.log('⚡ Sistema de físicas inicializado');
  },
  
  update(delta, controls) {
    if (!this.enabled) return;
    // Aquí irá la simulación: gravedad, colisiones, etc.
    // Por ahora, emitimos un evento de prueba cada 5 segundos
  },
  
  // Añadir un objeto físico
  addObject(obj) {
    this.objetos.push(obj);
    this.enabled = true;
  },
  
  // Emitir evento de colisión (para conectar con luz, sonido, etc.)
  emitColision(objA, objB) {
    core.emit('fisica:colision', { a: objA, b: objB });
  }
};
