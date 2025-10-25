# Heisenberg Backend

Backend para sistema de gestión de productos farmacéuticos con chatbot integrado.

## Requisitos

- Node.js 16+
- MySQL 8.0
- Docker (opcional)

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database Configuration
DB_PORT=3306
DB_ROOT_PASSWORD=root_password_123
DB_USER=heisenberg_user
DB_PASSWORD=heisenberg_pass_123
DB_NAME=heisenberg_db
DB_HOST=localhost
```

### 2. Iniciar Base de Datos con Docker

```bash
docker-compose up -d
```

### 3. Instalar Dependencias

```bash
npm install
```

## Scripts Disponibles

### Desarrollo

```bash
npm run dev
```

Inicia el servidor en modo desarrollo con recarga automática.

### Base de Datos

#### Crear tablas (migración)
```bash
npm run db:init
```

Crea las tablas en la base de datos sin eliminar datos existentes.

#### Crear tablas y agregar datos de prueba
```bash
npm run db:seed
```

Crea las tablas y agrega datos de prueba (usuarios, productos, sesiones de chat).

#### Reset completo (eliminar y recrear todo)
```bash
npm run db:reset
```

**⚠️ ADVERTENCIA:** Elimina todas las tablas y datos existentes, luego recrea todo con datos de prueba.

### Producción

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
src/
├── config/
│   ├── database.ts          # Configuración de Sequelize
│   └── init-database.ts     # Script de inicialización
├── domain/
│   ├── user.model.ts        # Modelo de Usuario
│   ├── product.model.ts     # Modelo de Producto
│   ├── chatbotSession.model.ts    # Modelo de Sesión de Chat
│   └── chatbotMessage.model.ts    # Modelo de Mensaje de Chat
├── handler/                 # Controladores HTTP
├── repository/              # Acceso a datos
└── server.ts               # Punto de entrada
```

## Modelos de Base de Datos

### User
- `id`: INTEGER (PK, autoincrement)
- `username`: VARCHAR
- `email`: VARCHAR
- `password_hash`: VARCHAR
- `role`: VARCHAR
- `created_at`: TIMESTAMP

### Product
- `id`: INTEGER (PK, autoincrement)
- `name`: VARCHAR
- `type`: VARCHAR
- `use_case`: TEXT
- `warnings`: TEXT
- `contraindications`: TEXT
- `expiration_date`: DATE
- `price`: DECIMAL(10,2)
- `stock`: INTEGER
- `created_at`: TIMESTAMP

### ChatbotSession
- `id`: INTEGER (PK, autoincrement)
- `user_id`: INTEGER (FK → User)
- `is_active`: BOOLEAN
- `created_at`: TIMESTAMP

### ChatbotMessage
- `id`: INTEGER (PK, autoincrement)
- `session_id`: INTEGER (FK → ChatbotSession)
- `sender`: VARCHAR
- `message`: TEXT
- `created_at`: TIMESTAMP

## Datos de Prueba

Al ejecutar `npm run db:seed` o `npm run db:reset`, se crearán:

### Usuarios
- **admin** (admin@heisenberg.com) - rol: admin
- **user_demo** (demo@heisenberg.com) - rol: user

### Productos
- Paracetamol 500mg
- Ibuprofeno 400mg
- Amoxicilina 500mg
- Loratadina 10mg

### Sesiones y Mensajes de Chat
- 2 sesiones de chat con conversaciones de ejemplo sobre medicamentos
