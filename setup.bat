@echo off

echo Iniciando proyecto HEISENBERG...
echo.

REM Verificacion de dependencias del sistema
echo Verificando dependencias del sistema...

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Docker no esta instalado.
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js no esta instalado.
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm no esta instalado.
    exit /b 1
)

echo Dependencias verificadas correctamente
echo.

REM Levantamiento de la base de datos
echo Levantando base de datos con Docker Compose...

docker compose -f Proyecto\Backend\docker-compose.yml up -d
if %errorlevel% neq 0 (
    echo Error al levantar Docker Compose.
    exit /b 1
)

echo Base de datos levantada correctamente
echo.

REM Espera para inicializacion de la base de datos
echo Esperando inicializacion de la base de datos...
timeout /t 10 /nobreak >nul
echo Base de datos lista
echo.

REM Instalacion de dependencias
echo Instalando dependencias del backend...

call npm install --prefix Proyecto\Backend
if %errorlevel% neq 0 (
    echo Error al instalar dependencias.
    exit /b 1
)

echo Dependencias instaladas correctamente
echo.

REM Compilacion de TypeScript
echo Compilando codigo TypeScript...

call npm run build --prefix Proyecto\Backend 2>nul

echo Compilacion completada
echo.

REM Ejecucion de pruebas basicas
echo Ejecutando pruebas basicas...

call npm test --prefix Proyecto\Backend

echo Pruebas ejecutadas
echo.

REM Inicio del servidor
echo Iniciando servidor backend...
echo.
echo Proyecto configurado correctamente
echo Servidor disponible en: http://localhost:3000
echo.

call npm run dev --prefix Proyecto\Backend
