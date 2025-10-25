#!/bin/bash
echo "Iniciando proyecto HEISENBERG..."

# 1. Verificar dependencias
command -v docker >/dev/null 2>&1 || { echo "Docker no está instalado."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js no está instalado."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm no está instalado."; exit 1; }

# 2. Levantar la base de datos desde Backend
echo "Levantando base de datos con Docker..."
docker compose -f Proyecto/Backend/docker-compose.yml up -d || { echo "Error al levantar Docker."; exit 1; }

# 3. Esperar que la BD esté lista
echo "Esperando que la base de datos inicie..."
sleep 10

# 4. Instalar dependencias del backend
echo "Instalando dependencias..."
npm install --prefix Proyecto/Backend

# 5. Ejecutar el servidor
echo "Iniciando servidor backend..."
npm run dev --prefix Proyecto/Backend
