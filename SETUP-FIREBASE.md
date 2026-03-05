# 🔥 Guía de Setup Firebase - 5 Minutos

## Paso 1: Crear Proyecto Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Click en **Add project** (Agregar proyecto)
3. Nombre: `mariett-coaching` (o el que prefieras)
4. Desactiva Google Analytics (no lo necesitamos) ❌
5. Click en **Create project**
6. Espera 30 segundos

## Paso 2: Configurar Firebase Auth

1. En tu proyecto, ve a **Build** > **Authentication**
2. Click en **Get started**
3. Click en **Email/Password**
4. Activa **Email/Password** ✅
5. Desactiva **Email link** (no lo usamos)
6. Click en **Save**

## Paso 3: Crear Usuario Coach

1. Sigue en **Authentication**
2. Ve a la pestaña **Users**
3. Click en **Add user**
4. Email: `mariett@coaching.com` (o el que prefieras)
5. Password: Crea una contraseña segura
6. Click en **Add user**
7. **¡IMPORTANTE!** Guarda este email y contraseña

## Paso 4: Configurar Firestore Database

1. Ve a **Build** > **Firestore Database**
2. Click en **Create database**
3. Selecciona ubicación: **southamerica-east1** (São Paulo)
4. Start in **production mode** (importante)
5. Click en **Create**
6. Espera 1 minuto

## Paso 5: Configurar Reglas de Seguridad

1. En Firestore, ve a la pestaña **Rules**
2. Reemplaza TODO el contenido con esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click en **Publish**

## Paso 6: Obtener Credenciales

1. Ve a **Project settings** (⚙️ arriba a la izquierda)
2. En la sección **Your apps**, click en el ícono **</>** (Web)
3. App nickname: `Mariett Coaching Web`
4. **NO** marques "Firebase Hosting"
5. Click en **Register app**
6. **COPIA** todas las credenciales que te muestra:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

7. **Guarda estas credenciales** - las necesitarás en el paso siguiente

## Paso 7: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

## Paso 8: Instalar y Ejecutar

```bash
npm install
npm run dev
```

## Paso 9: Probar

1. Abre `http://localhost:3000`
2. Haz login con el usuario que creaste
3. ¡Crea tu primer cliente!

---

## 🚀 Deploy a Netlify

En Netlify, agrega estas 6 variables de entorno:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Con los mismos valores del archivo `.env`.

---

## ✅ Checklist

- [ ] Proyecto Firebase creado
- [ ] Authentication configurado
- [ ] Usuario coach creado
- [ ] Firestore Database creado
- [ ] Reglas de seguridad actualizadas
- [ ] Credenciales copiadas
- [ ] Archivo `.env` creado
- [ ] `npm install` ejecutado
- [ ] App corriendo en localhost
- [ ] Login exitoso

¡Listo! Firebase configurado en 5 minutos 🎉
