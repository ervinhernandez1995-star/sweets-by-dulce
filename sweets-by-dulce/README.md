# 🎂 Sweets by Dulce — Deployment Guide

## Estructura del Proyecto

```
sweets-by-dulce/
├── vercel.json          ← Configuración de Vercel
├── README.md            ← Este archivo
└── public/
    ├── index.html       ← Página principal (clientes)
    ├── admin.html       ← Panel de administración
    └── images/          ← Carpeta para imágenes (ver abajo)
```

---

## 🚀 Cómo desplegar en Vercel

### Opción A — GitHub + Vercel (recomendado)

1. Sube esta carpeta a un repositorio en GitHub
2. Ve a [vercel.com](https://vercel.com) → New Project
3. Importa tu repositorio de GitHub
4. Vercel detecta automáticamente la configuración
5. Click **Deploy** — ¡listo!

### Opción B — Vercel CLI

```bash
npm i -g vercel
cd sweets-by-dulce
vercel --prod
```

---

## 🖼️ Imágenes

Coloca todas las imágenes en `public/images/`.

Los nombres de archivo que se usan en el catálogo son:
- `cakesicle-unicornio-arcoiris.jpg`
- `cakesicle-flores.jpg`
- `cakesicle-dinosaurio.jpg`
- `pastel-unicornio.jpg`
- `pastel-sirena.jpg`
- ... (y muchos más)

**Tip:** Si no tienes una imagen, la página muestra automáticamente un emoji 🧁 como fallback.

---

## 🔐 Panel de Administración

Accede en: `https://tu-dominio.vercel.app/admin`

- **Contraseña por defecto:** `dulce2024`
- Para cambiarla, edita `admin.html` y busca `ADMIN_PASSWORD`
- El admin guarda los datos en `localStorage` del navegador

### ¿Qué puede hacer el admin?

✅ Agregar nuevos postres con foto, nombre, descripción, categoría y precio  
✅ Editar productos existentes  
✅ Eliminar productos  
✅ Ver todos los productos del catálogo  
✅ Funciona en celular y desktop  

---

## 📱 Notas móvil

La página está optimizada para celular:
- Menú hamburguesa en mobile
- Barra de categorías con scroll horizontal
- Modal de productos responsive
- Panel admin 100% usable en celular

---

## ⚠️ Errores corregidos vs la versión MiniMax

1. **CSS roto** — había una regla CSS incompleta (`border-color` sin selector)
2. **Apóstrofe sin escapar** — `consultProduct('Purple Heart Cake R.I.P 20's')` causaba error JS
3. **`renderProducts` llamado antes del DOM** — movido a `DOMContentLoaded`
4. **Modal extra `</div>`** — había un div de cierre de más en el modal
5. **Precio no visible** — los productos ahora pueden mostrar precio desde el admin
6. **`openCustomization` no definida** — removida la llamada a función inexistente

