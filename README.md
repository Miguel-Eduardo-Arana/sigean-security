# Sigean Security - Módulo de Seguridad

Este proyecto es un sistema de gestión de seguridad integral desarrollado como parte de una evaluación de base de datos. Permite la administración completa (CRUD) de usuarios, roles, permisos, módulos y opciones del sistema, utilizando una arquitectura moderna Full-Stack.

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 19**: Biblioteca principal para la interfaz de usuario.
- **TypeScript**: Para un desarrollo robusto y tipado.
- **Tailwind CSS 4.0**: Framework de utilidades CSS para un diseño moderno y responsivo.
- **Lucide React**: Set de iconos vectoriales.
- **Framer Motion**: Para animaciones y transiciones fluidas.

### Backend
- **Node.js & Express**: Servidor web y API REST.
- **MongoDB**: Base de datos NoSQL para almacenamiento flexible de documentos.
- **Vite**: Herramienta de construcción y servidor de desarrollo ultra rápido.

## 📂 Estructura del Proyecto

```text
SIGEAN-SECURITY/
├── src/                    # Frontend (React)
│   ├── components/         # Componentes reutilizables
│   ├── App.tsx             # Lógica principal y Dashboard
│   ├── main.tsx            # Punto de entrada React
│   └── index.css           # Estilos globales con Tailwind
├── server.ts               # Backend (Express + MongoDB)
├── .env                    # Variables de entorno (Configuración)
├── package.json            # Dependencias y scripts
└── tsconfig.json           # Configuración de TypeScript
```

## 🛠️ Instalación y Configuración

### Requisitos Previos
- [Node.js](https://nodejs.org/) (v18 o superior)
- [MongoDB](https://www.mongodb.com/try/download/community) instalado y corriendo localmente (o una cuenta en MongoDB Atlas)

### Pasos para Ejecutar Localmente

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/sigean-security.git
   cd sigean-security
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   MONGODB_URI="mongodb://localhost:27017/sigean"
   ```

4. **Iniciar la aplicación en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Acceder a la aplicación:**
   Abre tu navegador en [http://localhost:3000](http://localhost:3000)

## ✨ Características Principales

- **Dashboard Intuitivo**: Panel central para acceder a los diferentes módulos de seguridad.
- **Gestión de Usuarios**: Registro, edición y eliminación de usuarios con validación de campos.
- **Control de Acceso (RBAC)**: Administración de Roles y Permisos.
- **Configuración de Sistema**: Gestión de Módulos y Opciones dinámicas.
- **Interfaz Responsiva**: Diseño adaptado para dispositivos móviles y escritorio.
- **Animaciones**: Transiciones suaves entre secciones para una mejor experiencia de usuario.

## 📝 Notas de Entrega
Este módulo ha sido diseñado para demostrar la integración entre una base de datos NoSQL (MongoDB) y una aplicación web moderna, cumpliendo con los requisitos de integridad y gestión de datos solicitados.

---
Desarrollado por [Equipo Quartet Code] - 2026
