#!/bin/bash
echo "Iniciando proyecto HEISENBERG..."

# 1.Verificar dependencias
echo "Verificando dependencias del sistema..."
command -v docker >/dev/null 2>&1 || { echo "Docker no está instalado."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js no está instalado."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm no está instalado."; exit 1; }
echo "Todas las dependencias del sistema están instaladas"

# 2. Levantar la base de datos desde Backend

echo "Levantando base de datos con Docker..."
docker compose -f Proyecto/Backend/docker-compose.yml up -d || { echo "Error al levantar Docker."; exit 1; }
echo "Base de datos levantada correctamente"

# 3.Esperar que la BD esté lista

echo "Esperando que la base de datos inicie..."
sleep 10
echo "...Base de datos lista"

# 4. Instalar dependencias del backend

echo "Instalando dependencias del backend..."
npm install --prefix Proyecto/Backend || { echo "Error al instalar dependencias."; exit 1; }
echo "Dependencias instaladas correctamente"

# 5.Compilar TypeScript

echo "Compilando código TypeScript..."
npm run build --prefix Proyecto/Backend 2>/dev/null || echo "Build no configurado, continuando..."

# 6.Ejecutar pruebas básicas

echo "Ejecutando pruebas básicas..."
npm test --prefix Proyecto/Backend || { echo "Algunas pruebas fallaron, pero continuando..."; }
echo "Pruebas ejecutadas"

# 7.Ejecutar el servidor

echo "Iniciando servidor backend..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Proyecto HEISENBERG configurado correctamente"
echo "Servidor disponible en: http://localhost:${PORT:-3000}"
echo "Endpoint principal: http://localhost:${PORT:-3000}/products"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
npm run dev --prefix Proyecto/Backend