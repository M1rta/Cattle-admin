# Sistema de Gestión de Ganado

Aplicación web full stack orientada a la administración de ganado bovino, diseñada para centralizar el control de animales, ubicación por finca, historial de vacunación y gestión de registros desde una interfaz visual e intuitiva.

Este proyecto fue desarrollado como una solución práctica enfocada en organización del código, trazabilidad de datos, estructura backend mantenible y escalabilidad para futuras mejoras como autenticación, multiusuario y reportes.

---

## Descripción del proyecto

El sistema permite registrar, consultar, editar y eliminar animales, visualizar su ubicación en mapa, administrar vacunas aplicadas y organizar la información de manera más clara que un proceso manual o disperso.

La idea principal fue construir una base sólida de backend y base de datos relacional, acompañada de una interfaz funcional y fácil de usar.

---

## Características principales

- CRUD completo de ganado
- Clasificación por tipo de animal
- Mapa interactivo con vista satelital
- Panel lateral con contadores dinámicos
- Listado filtrado por categoría
- Registro de vacunas por animal
- Historial de vacunación
- Arquitectura separada entre frontend y backend
- Base preparada para autenticación y expansión futura

---

## Tecnologías utilizadas

### Frontend
- HTML5
- CSS / SCSS
- JavaScript Vanilla
- Leaflet

### Backend
- Python
- Flask
- Flask-CORS
- MongoDB
- python-dotenv

### Herramientas
- Git / GitHub
- VS Code
- MongoDB Atlas
- Postman

---

## Estructura del proyecto

```text
CattleAdmin/
├── .vscode/
├── Api/
│   ├── index.py
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── static/
│   ├── templates/
│   ├── utils/
│   ├── models/
│   ├── db/ganado.db
│   
├── docs/
├── node_modules/
├── venv/
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
├── requirements.txt
└── vercel.json
```

## Funcionalidades implementadas

### Gestión de ganado
- Registro de animales
- Edición de información
- Eliminación de registros
- Consulta general de inventario

### Clasificación de animales
- Vaca
- Toro
- Ternera
- Ternero
- Destetado

### Panel lateral
- Contadores automáticos por tipo
- Lista dinámica de animales
- Filtros rápidos
- Integración visual con el módulo de vacunas

### Módulo de vacunas
- Asignación de múltiples vacunas por animal
- Registro de fecha de aplicación
- Consulta de historial
- Eliminación de vacunas asignadas

### Mapa interactivo
- Visualización geográfica de registros
- Marcadores dinámicos
- Vista satelital con Leaflet
- Base preparada para edición desde popup

---

## Enfoque técnico

- Separación de responsabilidades entre rutas, lógica y acceso a datos
- Organización modular del backend
- Estructura preparada para escalar
- Persistencia local con base de datos relacional
- Integración entre frontend y backend mediante consumo de API
- Diseño orientado a futuras mejoras como autenticación y multiusuario

Este proyecto no solo busca resolver una necesidad funcional, sino también reflejar una implementación organizada y mantenible desde el punto de vista técnico.

---

## Funcionalidades en desarrollo

- Login y registro de usuarios
- Autenticación con token
- Protección de rutas
- Asociación de registros por usuario
- Mejora visual del dashboard
- Gestión multiusuario

---

## Próximas mejoras

- Reportes exportables en PDF
- Historial sanitario más detallado
- Gestión de producción de leche
- Notificaciones
- Roles de usuario
- Mejoras de experiencia visual y usabilidad

---

## Autor

**WalterEsteban Elizondo Araya**  
