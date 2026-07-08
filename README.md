# Citización E-commerce — Frontend

Frontend de la plataforma corporativa de refacciones y cotizaciones para elevadores. Construido con **Vue 3**, **TypeScript** y **Vite**, consume un backend WordPress/WooCommerce a través de **GraphQL** (WooGraphQL).

## Requisitos

- Node.js `^22.18.0` o `>=24.12.0`
- npm
- Backend GraphQL en ejecución (ver repositorio `backend-wp` del monorepo)

## Configuración

1. Clona el repositorio e instala dependencias:

```sh
npm install
```

2. Copia el archivo de variables de entorno:

```sh
cp .env.example .env
```

3. Ajusta `VITE_GRAPHQL_URL` en `.env` si tu backend no corre en `http://localhost:8080/graphql`.

## Scripts disponibles

| Comando         | Descripción                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Servidor de desarrollo con hot-reload    |
| `npm run build` | Compilación de producción + type-check   |
| `npm run preview` | Vista previa del build de producción   |
| `npm run lint`  | Lint con Oxlint y ESLint                 |
| `npm run format`| Formateo con Prettier                    |

## Estructura del proyecto

```
src/
├── api/          # Cliente GraphQL
├── router/       # Rutas de la aplicación
├── types/        # Tipos TypeScript
└── views/        # Vistas (Inicio, Catálogo, Cotizador)
```

## Rutas

| Ruta         | Vista      | Descripción                          |
| ------------ | ---------- | ------------------------------------ |
| `/`          | HomeView   | Página de inicio                     |
| `/catalogo`  | CatalogView| Catálogo de refacciones con variantes|
| `/cotizador` | QuoteView  | Cotizador interactivo (en desarrollo)|

## Stack tecnológico

- [Vue 3](https://vuejs.org/) + [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/) — gestión de estado
- [Vite](https://vite.dev/) — bundler y dev server
- [graphql-request](https://github.com/jasonkuhrt/graphql-request) — cliente GraphQL
- TypeScript, ESLint, Oxlint, Prettier

## Desarrollo

Con el backend corriendo en Docker, inicia el frontend:

```sh
npm run dev
```

La aplicación estará disponible en `http://localhost:5173` (puerto por defecto de Vite).

## Licencia

Proyecto privado.
