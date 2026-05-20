# SGF - Sistema de Gestión Financiera

Sistema ejecutivo y corporativo para el control integral de ingresos, egresos, liquidaciones y reportes financieros.

## Características

- **Dashboard KPIs**: Total Ingresos, Total Egresos, Disponibilidad en tiempo real
- **Filtros globales**: Fecha desde/hasta, Tipo de movimiento, Categoría
- **Movimientos**: Listado ordenable con descarga CSV
- **Ingreso de Datos**: Carga manual con campos condicionales + importación de template bancario
- **Planificación de Liquidaciones**: Gestión de estados (Planificado / Liquidado / Sin Asignar)
- **Reportes**: Ingresos, Egresos y Cobranzas con gráficos interactivos
- **Control de acceso**: Perfil administrador protegido por contraseña

## Tecnologías

- React 18
- Recharts (gráficos)
- Vite (bundler)
- localStorage (persistencia de datos)

## Instalación local

```bash
npm install
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

## Deploy en Vercel

### Opción 1: Desde GitHub (recomendado)

1. Subir este repositorio a GitHub
2. Ir a [vercel.com](https://vercel.com) e iniciar sesión
3. Click en **"Add New Project"**
4. Importar el repositorio de GitHub
5. Vercel detectará automáticamente la configuración de Vite
6. Click en **"Deploy"**

### Opción 2: Desde CLI

```bash
npm i -g vercel
vercel
```

## Subir a GitHub

```bash
git init
git add .
git commit -m "Sistema de Gestión Financiera v1.0"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/sgf-sistema-financiero.git
git push -u origin main
```

## Acceso Administrador

- **Contraseña por defecto**: `admin2026`
- Cambiar en `src/App.jsx` buscando `admin2026`

## Estructura del proyecto

```
sgf-project/
├── index.html            # Entry HTML
├── package.json          # Dependencias
├── vite.config.js        # Configuración Vite
├── .gitignore
├── public/
│   └── favicon.svg       # Ícono
└── src/
    ├── main.jsx          # Bootstrap React
    └── App.jsx           # Aplicación completa
```
