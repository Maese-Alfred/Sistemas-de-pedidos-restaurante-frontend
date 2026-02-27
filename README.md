# Sistema de Pedidos de Restaurante — Frontend

Frontend del sistema de pedidos construido con React 18, TypeScript, Vite y TailwindCSS. Incluye vista de cliente para realizar pedidos y vista de cocina para gestionar ordenes.

## Stack tecnologico

| Tecnologia | Uso |
|------------|-----|
| React 18 | UI con TypeScript estricto |
| Vite | Bundler y dev server |
| TailwindCSS | Estilos |
| TanStack Query | Estado del servidor |
| Vitest | Testing |

## Levantar el proyecto con Docker

### Requisitos

- Docker Desktop instalado y corriendo
- Puertos libres: `5173`, `8080`, `8081`, `8082`, `5432`, `5433`, `5434`, `5672`, `15672`

### 1. Clonar ambos repositorios en una carpeta comun

```bash
mkdir Sistemas-de-pedidos-restaurante && cd Sistemas-de-pedidos-restaurante

git clone <url-backend> Sistemas-de-pedidos-restaurante-backend
git clone <url-frontend> Sistemas-de-pedidos-restaurante-frontend
```

Resultado esperado:

```
Sistemas-de-pedidos-restaurante/          # carpeta raiz
├── docker-compose.yml                    # orquestacion de servicios
├── docker-compose.dev.yml                # override para hot-reload (opcional)
├── .env                                  # variables de entorno
├── Sistemas-de-pedidos-restaurante-backend/
│   ├── order-service/
│   ├── kitchen-worker/
│   ├── report-service/
│   └── pom.xml
└── Sistemas-de-pedidos-restaurante-frontend/
    ├── src/
    └── package.json
```

### 2. Crear el archivo `.env` en la carpeta raiz

Crear el archivo `Sistemas-de-pedidos-restaurante/.env` con el siguiente contenido:

```dotenv
# ========================================
# ORDER SERVICE
# ========================================
SERVER_PORT=8080
DB_URL=jdbc:postgresql://postgres:5432/restaurant_db
DB_USER=restaurant_user
DB_PASS=restaurant_pass
KITCHEN_TOKEN_HEADER=X-Kitchen-Token
KITCHEN_AUTH_TOKEN=cocina123

# CORS — origenes permitidos para el frontend
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ========================================
# KITCHEN WORKER
# ========================================
KITCHEN_WORKER_PORT=8081
KITCHEN_DB_URL=jdbc:postgresql://kitchen-postgres:5432/kitchen_db
KITCHEN_DB_USER=kitchen_user
KITCHEN_DB_PASS=kitchen_pass

# ========================================
# REPORT SERVICE
# ========================================
REPORT_SERVICE_PORT=8082
REPORT_DB_URL=jdbc:postgresql://report-postgres:5432/report_db
REPORT_DB_USER=report_user
REPORT_DB_PASS=report_pass

# ========================================
# RABBITMQ
# ========================================
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# Exchange y Routing Keys
RABBITMQ_EXCHANGE_NAME=order.exchange
RABBITMQ_ROUTING_KEY_ORDER_PLACED=order.placed
RABBITMQ_ROUTING_KEY_ORDER_READY=order.ready
RABBITMQ_DLQ_ROUTING_KEY=order.placed.failed

# Colas Kitchen Worker
RABBITMQ_KITCHEN_QUEUE_NAME=order.placed.queue
RABBITMQ_KITCHEN_DLQ_NAME=order.placed.dlq
RABBITMQ_KITCHEN_DLX_NAME=order.dlx

# Colas Report Service
RABBITMQ_REPORT_QUEUE_NAME=order.placed.report.queue
RABBITMQ_REPORT_ORDER_READY_QUEUE_NAME=order.ready.report.queue
RABBITMQ_REPORT_DLQ_NAME=order.placed.report.dlq
RABBITMQ_REPORT_DLX_NAME=order.report.dlx

# ========================================
# BASES DE DATOS POSTGRES (contenedores Docker)
# ========================================
POSTGRES_DB=restaurant_db
POSTGRES_USER=restaurant_user
POSTGRES_PASSWORD=restaurant_pass

KITCHEN_POSTGRES_DB=kitchen_db
KITCHEN_POSTGRES_USER=kitchen_user
KITCHEN_POSTGRES_PASSWORD=kitchen_pass

REPORT_POSTGRES_DB=report_db
REPORT_POSTGRES_USER=report_user
REPORT_POSTGRES_PASSWORD=report_pass
```

> **Nota:** Las variables `POSTGRES_*` / `KITCHEN_POSTGRES_*` / `REPORT_POSTGRES_*` son usadas por los contenedores PostgreSQL. Las variables `DB_*` / `KITCHEN_DB_*` / `REPORT_DB_*` son las que usan los servicios Spring Boot.

### 3. Crear el archivo `docker-compose.yml` en la carpeta raiz

```yaml
x-common-config: &common-config
  env_file:
    - .env
  networks:
    - restaurant-net

services:
  postgres:
    <<: *common-config
    image: postgres:15
    container_name: restaurant-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-restaurant_db}
      POSTGRES_USER: ${POSTGRES_USER:-restaurant_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-restaurant_pass}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER:-restaurant_user} -d $${POSTGRES_DB:-restaurant_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  kitchen-postgres:
    <<: *common-config
    image: postgres:15
    container_name: kitchen-postgres
    environment:
      POSTGRES_DB: ${KITCHEN_POSTGRES_DB:-kitchen_db}
      POSTGRES_USER: ${KITCHEN_POSTGRES_USER:-kitchen_user}
      POSTGRES_PASSWORD: ${KITCHEN_POSTGRES_PASSWORD:-kitchen_pass}
    ports:
      - "5433:5432"
    volumes:
      - kitchen_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${KITCHEN_POSTGRES_USER:-kitchen_user} -d $${KITCHEN_POSTGRES_DB:-kitchen_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  report-postgres:
    <<: *common-config
    image: postgres:15
    container_name: report-postgres
    environment:
      POSTGRES_DB: ${REPORT_POSTGRES_DB:-report_db}
      POSTGRES_USER: ${REPORT_POSTGRES_USER:-report_user}
      POSTGRES_PASSWORD: ${REPORT_POSTGRES_PASSWORD:-report_pass}
    ports:
      - "5434:5432"
    volumes:
      - report_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${REPORT_POSTGRES_USER:-report_user} -d $${REPORT_POSTGRES_DB:-report_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  rabbitmq:
    <<: *common-config
    image: rabbitmq:3-management
    container_name: restaurant-rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_USER:-guest}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASS:-guest}
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  order-service:
    <<: *common-config
    image: ghcr.io/maese-alfred/sistemas-de-pedidos-restaurante/order-service:latest
    build:
      context: ./Sistemas-de-pedidos-restaurante-backend
      dockerfile: order-service/Dockerfile
    container_name: restaurant-order-service
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  kitchen-worker:
    <<: *common-config
    image: ghcr.io/maese-alfred/sistemas-de-pedidos-restaurante/kitchen-worker:latest
    build:
      context: ./Sistemas-de-pedidos-restaurante-backend
      dockerfile: kitchen-worker/Dockerfile
    container_name: restaurant-kitchen-worker
    ports:
      - "8081:8081"
    depends_on:
      kitchen-postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  report-service:
    <<: *common-config
    image: ghcr.io/maese-alfred/sistemas-de-pedidos-restaurante/report-service:latest
    build:
      context: ./Sistemas-de-pedidos-restaurante-backend
      dockerfile: report-service/Dockerfile
    container_name: restaurant-report-service
    ports:
      - "8082:8082"
    depends_on:
      report-postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  frontend:
    <<: *common-config
    image: ghcr.io/maese-alfred/sistemas-de-pedidos-restaurante/frontend:latest
    build:
      context: ./Sistemas-de-pedidos-restaurante-frontend
      dockerfile: Dockerfile.frontend
    container_name: restaurant-frontend
    ports:
      - "5173:8080"
    depends_on:
      - order-service

volumes:
  postgres_data:
  kitchen_postgres_data:
  report_postgres_data:
  rabbitmq_data:

networks:
  restaurant-net:
    driver: bridge
```

> **Puerto del frontend:** El contenedor sirve internamente en el puerto `8080` (Vite preview), mapeado al puerto `5173` del host.

### 4. Iniciar el stack

```bash
cd Sistemas-de-pedidos-restaurante

# Construir y levantar todos los servicios
docker compose up --build -d

# Verificar que todo este corriendo
docker compose ps
```

### URLs disponibles

| Recurso | URL |
|---------|-----|
| Frontend (cliente) | http://localhost:5173 |
| Frontend (cocina) | http://localhost:5173/kitchen |
| API Order Service | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Report Service API | http://localhost:8082 |
| RabbitMQ Management | http://localhost:15672 (guest / guest) |

### Comandos utiles

```bash
# Ver logs del frontend
docker compose logs -f frontend

# Reiniciar el frontend
docker compose restart frontend

# Detener todo
docker compose down

# Detener y eliminar datos persistidos
docker compose down -v
```

## Arquitectura del frontend

```
src/
├── api/                 # Llamadas HTTP al backend
├── app/                 # Contextos y providers
├── components/          # Componentes React reutilizables
├── domain/              # Tipos, interfaces y reglas de negocio
│   ├── contracts.ts     # Contratos de datos (tipos compartidos)
│   └── orderStatus.ts   # Maquina de estados de ordenes
├── pages/               # Vistas (cliente, cocina, reportes)
├── store/               # Estado global (Context API)
├── test/                # Fixtures y mocks para testing
├── App.tsx              # Routing principal
├── main.tsx             # Entry point
└── styles.css           # Estilos globales (Tailwind)
```

### Convenciones

- Reglas de negocio en `domain/`, nunca en componentes UI
- Transiciones de estado solo via `orderStatus.ts`
- Contratos de datos definidos en `contracts.ts` (no duplicar)
- `api/` contiene los contratos HTTP con el backend
- `pages/` son las vistas, `components/` son reutilizables

## Modos de ejecucion

| Variable | Valor | Efecto |
|----------|-------|--------|
| `VITE_USE_MOCK` | `false` (default) | Usa el backend real |
| `VITE_USE_MOCK` | `true` | Datos simulados (desarrollo sin backend) |
| `VITE_ALLOW_MOCK_FALLBACK` | `false` (default) | Sin fallback silencioso |
| `VITE_API_BASE_URL` | `http://localhost:8080` | URL del backend |

## Seguridad de cocina (frontend)

| Variable | Valor por defecto | Descripcion |
|----------|-------------------|-------------|
| `VITE_KITCHEN_TOKEN_HEADER` | `X-Kitchen-Token` | Header HTTP |
| `VITE_KITCHEN_PIN` | `cocina123` | PIN de acceso a cocina |

## Desarrollo local sin Docker

Requiere Node.js 20+:

```bash
cd Sistemas-de-pedidos-restaurante-frontend

# Instalar dependencias
npm install

# Servidor de desarrollo con hot-reload
npm run dev

# Ejecutar tests
npm run test

# Tests con cobertura
npm run test:coverage

# Build de produccion
npm run build

# Preview del build
npm run preview
```

> Requiere el backend corriendo en `http://localhost:8080` (o usar `VITE_USE_MOCK=true`).

## Smoke test rapido

Con el stack Docker corriendo:

```bash
# Ver menu
curl http://localhost:8080/menu

# Crear una orden
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{"tableId":1,"items":[{"productId":1,"quantity":2}]}'

# Consultar ordenes desde cocina
curl "http://localhost:8080/orders?status=PENDING,IN_PREPARATION,READY" \
  -H "X-Kitchen-Token: cocina123"
```

## Estructura del repositorio

```
Sistemas-de-pedidos-restaurante-frontend/
├── src/                         # Codigo fuente
├── public/                      # Assets estaticos
├── scripts/                     # Helpers (docker, smoke tests)
├── docs/                        # Documentacion
│   ├── development/             # Guias rapidas
│   ├── quality/                 # Calidad y deuda tecnica
│   └── auditoria/               # Auditorias
├── package.json                 # Dependencias y scripts
├── vite.config.ts               # Configuracion Vite
├── vitest.config.ts             # Configuracion Vitest
├── tailwind.config.cjs          # Configuracion Tailwind
├── tsconfig.json                # TypeScript config
├── eslint.config.js             # ESLint config
├── sonar-project.properties     # SonarCloud config
├── Dockerfile.frontend          # Imagen de produccion
├── Dockerfile.frontend.dev      # Imagen de desarrollo (hot-reload)
└── README.md                    # Este archivo
```

## Documentacion adicional

- [Guia rapida de desarrollo](docs/development/GUIA_RAPIDA.md)
- [Auditoria](docs/auditoria/AUDITORIA.md)
- [Calidad y pruebas](docs/quality/CALIDAD.md)
- [Deuda tecnica](docs/quality/DEUDA_TECNICA.md)
