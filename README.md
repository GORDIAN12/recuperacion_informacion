# Guía de Configuración del Proyecto Node.js + MySQL

Este documento detalla los pasos necesarios para configurar el entorno de desarrollo, instalar las dependencias y preparar la base de datos para el proyecto.

---

## 1. Verificación de Requisitos
Asegúrate de que el entorno cuente con las herramientas básicas instaladas ejecutando:

* **Node.js:** `node -v`
* **npm:** `npm -v`
* **MySQL:** `mysql --version`

---

## 2. Inicialización e Instalación
Ejecuta los siguientes comandos en la raíz de tu proyecto para gestionar las dependencias:

### Inicializar el proyecto
```bash
npm init -y

# Servidor, conexión a DB, CORS y variables de entorno
npm install express mysql2 cors dotenv

# Seguridad y cifrado de contraseñas
npm install bcrypt
```
Configuración del Entorno (.env)
Crea un archivo llamado .env en la raíz del proyecto para almacenar las credenciales.

Nota: Asegúrate de que los datos coincidan con tu configuración local de MySQL.
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=XXXXXXXXXXXXXX
DB_NAME=netflix_clone
```
Inicialización de la Base de Datos
Para cargar la estructura de tablas y los datos iniciales desde tu archivo SQL, utiliza el siguiente comando en la terminal:
```
mysql -u root -p < schema.sql
```


## ejecutar programa
```
node server/server.js```
