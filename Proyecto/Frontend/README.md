# Frontend – Heisenberg

Este directorio contiene el **frontend** de la aplicación, construido con **React + TypeScript** sobre **Vite** y usando **TailwindCSS** y **shadcn/ui**.

## Requisitos previos

- **Node.js** ≥ 18 (recomendado LTS)
- **npm** (incluido con Node)  
  Opcionalmente puedes usar **bun** o **pnpm**, pero los comandos de ejemplo usan `npm`.

## Instalación de dependencias

Desde la carpeta `Proyecto/Frontend` ejecuta:

```bash
npm install
```

Esto descargará todos los paquetes necesarios definidos en `package.json`.


## Ejecutar el proyecto en desarrollo

Desde `Proyecto/Frontend`:

```bash
npm run dev
```

Por defecto, Vite levanta el servidor en `http://localhost:5173` (puede variar si el puerto está ocupado).  
La consola mostrará la URL exacta.

## Build para producción

Generar el build optimizado:

```bash
npm run build
```

Esto creará la carpeta `dist/` con los archivos listos para ser servidos por un servidor web.

Puedes previsualizar el build con:

```bash
npm run preview
```

## Linter

Para analizar el código con **ESLint**:

```bash
npm run lint
```

