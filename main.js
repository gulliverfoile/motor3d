// ============================================
// main.js - Punto de entrada del motor 3D
// Registra todos los módulos y servicios
// ============================================

import { core } from './core.js';
import { gfxManager } from './services/gfx-manager.js';
import { forwardRenderer } from './renderers/forward/index.js';
import { cameraModule } from './modules/camera/index.js';
import { physicsWorld } from './modules/physics-world/index.js';

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando motor 3D hexagonal...');
    core.init('canvas', 'floating-log');

    // 1. Inicializar servicio gráfico
    core.gfx = gfxManager;
    gfxManager.init(core);

    // 2. Registrar módulos del sistema 3D
    core.registerModule('camera', cameraModule);
    core.registerModule('physics-world', physicsWorld);
    
    // 3. Registrar renderizador 3D (se activa automáticamente si está enabled)
    core.registerModule('renderer-forward', forwardRenderer);

    // 4. Iniciar con el renderizador 3D como módulo activo
    core.switchModule('renderer-forward');
    
    console.log('✅ Motor 3D listo. Deberías ver un cubo girando.');
    window.core = core;
});