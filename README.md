# Tigre App - Prototipo (Secretaría de Mujeres, Géneros e Infancias)

Prototipo interactivo de la app del Municipio de Tigre:
- **Dashboard público** (rojo/blanco) para vecinos: carrusel de novedades, próximos eventos con cupos y botón de "Anotarme", contactos de emergencia y bitácora anónima (con selector Género/Infancia).
- **Plataforma de Género** (violeta) y **Plataforma de Infancia** (verde): paneles internos de staff, con 3 sub-perfiles (Coordinador/a, Director/a Coordinador/a, Director/a General), gestión de calendario (talleres/turnos con cupos), carga de novedades al carrusel, bitácora con estados (Pendiente / En seguimiento / Resuelto / Falso aviso), escalamiento jerárquico, derivación de casos entre Género e Infancia con acuse de recibo, estadísticas, gráficos (tortas) y exportación a CSV.

## Estructura de carpetas

```
tigre-app/
├── index.html          → estructura HTML de todas las pantallas
├── css/
│   └── style.css        → todos los estilos (variables de color por tema, layout, componentes)
├── js/
│   └── app.js            → toda la lógica: datos en memoria y funciones de interacción
└── assets/
    └── logo-tigre.png    → isologo del Municipio de Tigre (fondo transparente)
```

## Cómo abrirlo
No necesita build ni instalación de dependencias (es HTML/CSS/JS plano):

1. Abrí `index.html` directamente en el navegador, o
2. Desde VS Code, instalá la extensión **Live Server** y hacé clic derecho sobre `index.html` → "Open with Live Server" (recomendado, para que las rutas relativas a `css/`, `js/` y `assets/` carguen bien).

## Estado del prototipo
- Todos los datos (talleres, novedades, bitácoras) viven **en memoria** (variables de `js/app.js`). Se reinician al recargar la página — todavía no hay backend ni base de datos real.
- No hay login real todavía (usuario y contraseña por rol queda pendiente para una etapa posterior).
- El selector de "sub-perfil" (Coordinador/a, Director/a Coordinador/a, Directora/Director General) es solo visual, para poder mostrar las distintas vistas en la misma demo.

## Dónde está cada cosa en el código
**`js/app.js`**
- `events` — talleres/turnos por plataforma (día, mes, título, detalle, cupo, anotados)
- `novedades` — ítems del carrusel del home, por plataforma
- `bitacoras` — avisos anónimos recibidos, con estado, responsable, log de seguimiento y derivación entre plataformas
- Funciones de render: `renderAllEvents`, `renderCarousel`, `renderBitacoraPanels`, `renderBitacoraPie`
- Funciones de interacción: `addEvent`, `editEvent`, `removeEvent`, `submitBitacora`, `setBitacoraStatus`, `escalateBitacora`, `deriveBitacora`, `acknowledgeBitacora`, `addNovedad`, `exportStats`, `anotarseEvento`

**`css/style.css`**
- Variables de color en `:root` (rojo, violeta, verde) — se pisan por pantalla vía JS (`themes` en `app.js`) para cambiar de tema.
- Clases reutilizables: `.contact-card`, `.event-item`, `.bitacora-item`, `.pie-chart`, `.stat-card`, etc.

## Próximos pasos sugeridos
- Reemplazar los datos en memoria por llamadas a un backend real (API + base de datos).
- Sumar autenticación real por rol (hoy el selector de sub-perfil es solo una simulación visual).
- Completar y confirmar con la Secretaría los datos de contacto y el directorio de derivación externa antes de publicar.
