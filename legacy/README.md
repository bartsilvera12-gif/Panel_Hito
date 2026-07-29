# Panel Hito — Sitio web

Sitio de una página para Panel Hito (paneles termoacústicos).

## Archivos
- `index.html` — el sitio completo (misma fuente que `Panel Hito - Sitio Web.dc.html`).
- `support.js` — runtime necesario, debe quedar junto al HTML.
- `brand/` — logos oficiales (azul profundo, blanco, cian). No modificar ni deformar.

## Publicar en GitHub Pages
1. Subir todo el contenido a un repositorio.
2. Settings → Pages → Branch: `main` / carpeta `/ (root)`.
3. El sitio queda en `https://usuario.github.io/repositorio/`.

## Dónde editar
- **WhatsApp / teléfono / correo**: props `whatsappNumber`, `telefonoVisible`, `correo` en el bloque `data-props` al final del HTML.
- **Productos, proyectos, preguntas y textos**: directamente en el HTML, cada sección está marcada con `data-screen-label`.
- **Imágenes**: los bloques rayados con etiqueta monoespaciada (hero, productos, proyectos) son los espacios a reemplazar por fotos reales.
- **Formulario**: hoy simula el envío; conectar `onSubmit` en la clase `Component` al servicio de correo o backend que usen.

## Colores oficiales
Azul profundo `#002A3B` · Cian `#2CC3EF` · Blanco `#FFFFFF` · Fondo claro `#F4F7F8` · Gris texto `#61717A`
