# Proyecto 1 - Backend

API desarrollada con NestJS para el sistema de logística. Este backend centraliza la autenticación, la administración de clientes, productos, bodegas, puertos y envíos, además de la integración con Prisma, PostgreSQL y colas de procesamiento con Redis.

## Alcance realizado

- Autenticación con registro e inicio de sesión mediante JWT.
- Control de acceso por roles, con permisos diferenciados para administradores y usuarios autenticados.
- CRUD de clientes, productos, bodegas y puertos.
- Gestión de envíos terrestres y marítimos.
- Consulta del siguiente número de guía disponible.
- Procesamiento en segundo plano para envíos de gran volumen.
- Documentación de la API con Swagger.
- Manejo global de errores, logging y transformación estándar de respuestas.
- Validaciones personalizadas para placas, números de guía y números de flota.

## Tecnologías utilizadas

- NestJS
- Prisma
- PostgreSQL
- Redis
- Bull
- JWT / Passport
- Swagger
- Class Validator / Class Transformer

## Estructura general

- `src/auth`: login, registro y estrategia JWT.
- `src/clients`: administración de clientes.
- `src/products`: administración de productos.
- `src/location`: bodegas y puertos.
- `src/shipments`: creación, consulta, actualización, rechazo y eliminación de envíos.
- `src/core`: guards, filtros, interceptores y middleware globales.
- `src/shared`: validaciones y utilidades compartidas.
- `prisma`: esquema, migraciones y seed de datos.

## Requisitos previos

- Node.js >= 18
- Docker y Docker Compose

## Variables de entorno

Copia el archivo de ejemplo y ajusta los valores según tu entorno:

```bash
cp .env.example .env
```

## Ejecutar el proyecto

### Opción 1 — Con Docker (recomendado)

```bash
# Levantar PostgreSQL, Redis y la app en contenedores
docker-compose up -d

# Levantar reconstruyendo la imagen de la app
docker-compose up --build -d

# Ver logs de los contenedores
docker-compose logs -f

# Detener todos los contenedores
docker-compose down

# Detener y eliminar volúmenes (borra los datos)
docker-compose down -v
```

### Opción 2 — Local (requiere PostgreSQL y Redis corriendo)

```bash
npm install
npm run start:dev
```

## Base de datos (Prisma)

```bash
# Generar el cliente de Prisma tras cambios en el schema
npx prisma generate

# Crear y aplicar una nueva migración en desarrollo
npx prisma migrate dev --name <nombre-de-la-migración>

# Aplicar migraciones en producción
npx prisma migrate deploy

# Poblar la base de datos con datos iniciales
npm run db:seed

# Abrir Prisma Studio (explorador visual de la BD)
npx prisma studio
```

## Scripts disponibles

```bash
# Servidor
npm run start              # Producción (sin compilar)
npm run start:dev          # Desarrollo con hot-reload
npm run start:debug        # Desarrollo con debugger adjunto
npm run start:prod         # Producción (desde dist/)
npm run build              # Compilar a dist/

# Calidad de código
npm run lint               # Lint con auto-fix
npm run format             # Formatear con Prettier

# Tests
npm run test               # Unit tests
npm run test:watch         # Unit tests en modo watch
npm run test:cov           # Unit tests con reporte de cobertura
npm run test:e2e           # Tests end-to-end
npm run test:debug         # Tests con debugger adjunto

# Base de datos
npm run db:seed            # Seed de datos iniciales
```

## Notas técnicas

- Prisma se usa como capa de acceso a datos y el seed inicial vive en `prisma/seed.ts`.
- El backend expone los recursos principales de la plataforma logística y protege las operaciones sensibles con roles.

## Justificación de las tecnologías empleadas y patrones de diseño

- Backend: Fue escogido NestJS por su arquitectura modular que obliga a separar responsabilidades desde el inicio lo que hace el código fácil de escalar y de mantener. Se usa Typescript para tener un mejor tipado de parametros y de retornos.

- Base de datos: Se seleccionó PostgreSQL con prisma ya que es un poco más maduro y sencillo de dockerizar, por su robustezz en la parte de relaciones y madurez en entorno de producción. Se escoge Prisma para reemplazar el uso de decoradores y que el modelo de datos solo esté en el schema.prisma permitiendo que el modelo ER sea legible sin necesidad de leer código

- Docker compose: Permite que cualquier desarrollador levante el proyecto con un solo comando docker-compose up sin instalar PostgreSQL ni redis localmente. Permite que los los volumenes garanticen que los datos sobrevivan con reinicios del contenedor.

- Swagger: Se integra swagger nativamente con NestJS generando con los decoradores @ApiOperation, @ApiResponse y @ApiBearerAuth documentación automáticamente desde el código. Se pueden probar todos los endpoints desde http://localhost:3000/api/docs sin necesidad del uso de postman.

- Patrones de diseño:
  - Strategy + Factory Method: Se usa este patrón para el módulo de envíos, ya que el sistema maneja dos tipos de logistica con reglas de negocio distintas: descuento del 5% para terrestre y 3% para maritima, diferentes campos requeridos (placa vs número de flota) y diferentes distintos de entrega (bodega vs puerto). Se definió la interfaz ShipmentStrategy con tres métodos: calculatePrice(), validateFields() y getDestinationId(). Cada tipo de logística implementa su propia estrategia (TerrestrialShipmentStrategy y MaritimeShipmentStrategy), y el ShipmentFactory decide en tiempo de ejecución cuál instanciar según el logisticType recibido. El resultado es que ShipmentsService nunca sabe con qué tipo de logística está trabajando. Si en el futuro se agrega logística aérea, solo se crea una nueva estrategia y se registra en la factory, sin tocar el servicio ni el controlador.
  - Módulo Core con Providers Globales: NestJS permite registrar filtros, guards e interceptors como providers globales usando APP_FILTER, APP_GUARD y APP_INTERCEPTOR. Esto centraliza tres responsabilidades transversales en un único módulo: el GlobalExceptionFilter captura todos los errores de la aplicación y los transforma en respuestas HTTP con el formato estándar { statusCode, message, error, path, timestamp }, manejando específicamente los errores de Prisma (P2002 → 409 Conflict, P2025 → 404 Not Found). El ResponseTransformInterceptor envuelve todas las respuestas exitosas en el mismo envelope estándar. El JwtAuthGuard protege todas las rutas por defecto. El resultado es que ningún controlador necesita manejar errores ni formatear respuestas manualmente.

  - Decorator Pattern; validadores y metadatos: Los decoradores personalizados @IsVehiclePlate(), @IsFleetNumber(), @IsGuideNumber(), @Public(), @Roles() y @CurrentUser() encapsulan comportamiento que se aplica de forma declarativa sobre clases y métodos. Esto mantiene los DTOs y controladores limpios de lógica imperativa y hace que las reglas de negocio sean legibles directamente en la firma del código.

  - Axios: Centraliza todas las llamadas HTTP en una única instancia (api.client.ts) con dos interceptores: el de request inyecta el Bearer token automáticamente en cada llamada sin necesidad de configurarlo en cada servicio, y el de response captura los errores 401 globalmente, limpia la sesión y redirige al login.
