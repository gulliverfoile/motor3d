# 🧊 Motor 3D Hexagonal – Renderizador mínimo con arquitectura limpia

Motor 3D desde cero con **WebGL 2.0 nativo**, construido sobre una arquitectura hexagonal modular. Sin dependencias externas, sin librerías de terceros. Solo JavaScript, GLSL y ganas de entender cómo funciona un motor por dentro.

## ✨ Características

- 🧩 **Arquitectura hexagonal**: núcleo (`core.js`), servicios, módulos y renderizadores intercambiables.
- 📡 **Bus de eventos**: comunicación desacoplada entre sistemas (física, luces, cámara, render).
- 📷 **Cámara 3D**: control de posición, orientación, matrices de vista y proyección.
- 💡 **Iluminación Phong**: shaders GLSL con componente ambiente, difusa y especular.
- 🧊 **Cubo giratorio**: geometría de prueba con VAO, VBO e índice de triángulos.
- ⚙️ **Preparado para físicas y luces dinámicas**: módulos placeholder listos para expandir.
- 🧠 **Sin dependencias**: solo necesitas un navegador con soporte WebGL 2.0.

## 🚀 Cómo usarlo

1. Clona el repositorio o descarga los archivos.
2. Abre `index.html` en un navegador moderno (Chrome, Edge, Firefox).
3. Verás un cubo azul girando con iluminación. No hay controles de momento; la cámara es fija.
4. Abre la consola del navegador (F12) para ver los logs de inicialización.

## 🧱 Estructura del proyecto
motor-3d/
├── index.html # Punto de entrada
├── main.js # Orquestador: registra servicios y módulos
├── core.js # Núcleo hexagonal (eventos, bucle, módulos)
├── services/
│ └── gfx-manager.js # Servicio gráfico (shaders, buffers, VAO)
├── renderers/
│ └── forward/
│ └── index.js # Renderizador 3D Forward con shaders Phong
├── modules/
│ ├── camera/
│ │ └── index.js # Módulo de cámara 3D
│ └── physics-world/
│ └── index.js # Placeholder de sistema de físicas
└── README.md

text

## 🧠 Arquitectura hexagonal en pocas palabras

- **Core (`core.js`)**: no sabe de gráficos, solo maneja el ciclo de vida y el bus de eventos.
- **Puertos**: interfaces implícitas que los módulos deben cumplir (`init`, `update`, `draw`).
- **Adaptadores**: el renderizador `forward` es un adaptador que implementa la salida gráfica usando WebGL. Puedes crear otro (`deferred`, `raytracing`) sin tocar el núcleo.
- **Servicios**: `gfxManager` ofrece herramientas de bajo nivel (compilar shaders, crear buffers) sin ser un módulo del bucle principal.

## 🗺️ Roadmap

- [ ] Controles de cámara con ratón (orbitación).
- [ ] Sistema de físicas real (AABB, gravedad, colisiones).
- [ ] Gestor de luces dinámicas (puntuales, direccionales).
- [ ] Carga de modelos `.obj` o `.glb`.
- [ ] Sombras básicas (shadow mapping).
- [ ] Cambio en caliente entre renderizadores (forward ↔ deferred).

## 📜 Licencia

AGPLv3 – Software libre. Puedes usar, modificar y distribuir, siempre que mantengas las mismas libertades. El código está pensado para aprender y experimentar, no para hacer cajas negras.

---

*Construido desde cero, sin prisas, con arquitectura hexagonal y un cubo que da vueltas.*
