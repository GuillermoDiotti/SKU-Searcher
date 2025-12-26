# Buscador de SKUs - Muebles

Una herramienta interna simple para buscar imágenes y videos de productos en Google Drive usando el SKU.

## Configuración Necesaria

Para que la página funcione, deben editar el archivo `script.js` y colocar las credenciales de Google Cloud de la empresa.

1.  Abre el archivo `script.js`.
2.  Busca la sección `CONFIG` en las primeras líneas.
3.  Reemplaza los valores con los reales:

```javascript
const CONFIG = {
    clientId: 'TU_CLIENT_ID_AQUI', 
    apiKey: 'TU_API_KEY_AQUI',
};
```

**Nota**: El "Client ID" y la "API Key" se obtienen en la [Google Cloud Console](https://console.cloud.google.com/).

## Uso

1.  Abre la página.
2.  Haz clic en "Ingresar" (Login con Google).
3.  Escribe el SKU del producto (ej: `MES-001`).
4.  Verás las fotos y videos disponibles para descargar.

## Despliegue (GitHub Pages)

1.  Sube estos archivos a un repositorio de GitHub.
2.  Ve a `Settings` > `Pages`.
3.  Elige la rama `main` y guarda.
4.  **Importante**: En la Google Cloud Console, debes agregar la URL de tu página (ej: `https://tu-usuario.github.io`) en los "Orígenes de JavaScript autorizados" de tu credencial OAuth.
