# 🔥 Mariett Alcayaga - Sistema de Coaching (Firebase)

Sistema web para gestión de clientes de coaching de salud y bienestar con **Firebase**.

## ⭐ Novedades en esta versión Firebase:

- ✅ **Migrado de Supabase a Firebase Firestore**
- ✅ **Real-time updates** - Los cambios se reflejan instantáneamente
- ✅ **Eliminación de clientes** - Nueva funcionalidad completa
- ✅ **Optimizado para NoSQL** - Estructura de datos Firebase
- ✅ **Mismo UI/UX** - Cero cambios visuales

## 🎯 Características

- 🔐 Autenticación con Firebase Auth
- 👥 Gestión de clientes (crear, editar, **eliminar**)
- 📋 Historia de salud completa
- 🎯 Objetivos de bienestar (3 principales)
- 📝 Sesiones con PDFs editables
- 🔥 Real-time updates automáticos
- 📱 Responsive design
- 🎨 Colores de marca Mariett

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Base de datos**: Firebase Firestore (NoSQL)
- **Autenticación**: Firebase Auth
- **Estilos**: Tailwind CSS
- **PDFs**: pdf-lib
- **Deploy**: Netlify
- **Costo**: $0/mes (plan gratuito)

## 📦 Instalación Rápida

### 1. Configurar Firebase (5 minutos)

Sigue la guía: **SETUP-FIREBASE.md**

Resumen:
1. Crear proyecto en Firebase Console
2. Activar Authentication (Email/Password)
3. Crear usuario coach
4. Crear Firestore Database
5. Configurar reglas de seguridad
6. Obtener credenciales

### 2. Instalar localmente

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Firebase

# Iniciar aplicación
npm run dev
```

Abre http://localhost:3000

### 3. Deploy a Netlify

1. Sube el código a GitHub
2. Conecta con Netlify
3. Agrega las 6 variables de entorno de Firebase
4. Deploy automático

## 🗄️ Estructura Firestore

```
clientes/
  {clienteId}/
    - nombre
    - email
    - celular
    - edad
    - ocupacion
    - fecha_nacimiento
    - created_at
    - updated_at

historias_salud/
  {clienteId}/  (mismo ID que cliente)
    - objetivos_salud
    - peso
    - estatura
    - ... (todos los campos del formulario)

objetivos/
  {clienteId}/  (mismo ID que cliente)
    - objetivo_1
    - objetivo_2
    - objetivo_3
    - por_que_importantes
    - que_interfiere

sesiones/
  {sesionId}/  (ID autogenerado)
    - cliente_id
    - numero_sesion
    - fecha
    - tipo_nota ('simple' o 'con_acuerdos')
    - notas / acuerdos / metodos
```

## 🆕 Nuevas Funcionalidades

### Eliminación de Clientes

En el Dashboard, cada cliente tiene un botón de eliminar (🗑️):

- Elimina el cliente
- Elimina su historia de salud
- Elimina sus objetivos
- Elimina **todas** sus sesiones
- **Confirmación** antes de eliminar
- **No reversible**

### Real-time Updates

Todos los cambios se reflejan instantáneamente:
- Creas un cliente → aparece en el Dashboard
- Editas una sesión → se actualiza automáticamente
- Otro usuario hace cambios → los ves en tiempo real

## 🔄 Diferencias con Supabase

| Aspecto | Supabase | Firebase |
|---------|----------|----------|
| Base de datos | PostgreSQL (SQL) | Firestore (NoSQL) |
| Queries | `.from().select()` | `collection(), getDocs()` |
| Real-time | Polling | `onSnapshot()` nativo |
| Estructura | Tablas relacionales | Colecciones/documentos |
| Setup | SQL schema | Reglas de Firestore |
| Costo | Similar | Similar |

## 💰 Costos Firebase

Plan **Spark (Gratis)**:
- 50K document reads/day
- 20K document writes/day  
- 1GB storage
- 10GB network/month

**Suficiente para 50-100 coaches sin pagar** 💪

## 📝 Variables de Entorno

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 🔒 Seguridad

- Solo usuarios autenticados pueden acceder
- Reglas de Firestore impiden acceso no autorizado
- Variables de entorno para credenciales
- HTTPS en producción (Netlify)

## 📖 Documentación

- `SETUP-FIREBASE.md` - Guía de configuración (5 minutos)
- `README.md` - Este archivo
- Código comentado y organizado

## 🚀 Próximas Mejoras

- 📧 Envío automático de PDFs por email
- 📅 Sistema de citas/calendario  
- 📊 Dashboard con estadísticas
- 📱 App móvil (React Native + Firebase)
- 🔔 Notificaciones push (Firebase Cloud Messaging)

## 🐛 Troubleshooting

**Error de autenticación:**
- Verifica variables de entorno en `.env`
- Confirma que el usuario existe en Firebase Auth

**No carga datos:**
- Verifica reglas de Firestore
- Revisa consola del navegador (F12)

**Build falla:**
- Ejecuta `rm -rf node_modules && npm install`
- Verifica que todas las dependencias estén instaladas

## 📞 Soporte

Para dudas o problemas:
1. Revisa `SETUP-FIREBASE.md`
2. Verifica consola del navegador
3. Revisa Firebase Console

---

**Desarrollado con ❤️ para Mariett Alcayaga**  
**Versión Firebase 2.0 - Febrero 2026**
