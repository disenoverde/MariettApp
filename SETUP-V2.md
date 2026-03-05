# MariettApp v2.0 — Setup Guide

## Nuevas funcionalidades en esta versión

- ✅ **Sistema de roles**: coach y cliente con custom claims de Firebase Auth
- ✅ **Portal del paciente**: acceso separado con `/login-cliente` y `/portal`
- ✅ **Invitaciones por código**: genera y envía códigos únicos de 6 caracteres
- ✅ **Rueda del Bienestar**: interactiva con 12 áreas, polígono SVG, comparación inicial/final
- ✅ **Contratos digitales**: creación, envío, firma digital del cliente
- ✅ **EmailJS**: emails automáticos de invitación y contrato

---

## 1. Variables de entorno

Copia `.env.example` a `.env` y completa todos los valores:

```bash
cp .env.example .env
```

---

## 2. Firebase: habilitar Cloud Functions

El sistema de roles requiere **Firebase Cloud Functions** para asignar custom claims.

```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Login
firebase login

# Inicializar functions en el proyecto
firebase init functions
# → Selecciona JavaScript
# → No instales ESLint
# → Sí instala dependencias

# Copia el archivo de la función
cp functions/index.js functions/index.js  # ya está en el repo

# Instala dependencias de la función
cd functions && npm install firebase-admin firebase-functions && cd ..

# Deploy de la función
firebase deploy --only functions
```

---

## 3. Firestore Security Rules

En la consola de Firebase → Firestore → Rules, pega el contenido de `firestore.rules`.

O despliega con CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. EmailJS — Configuración paso a paso

1. Crea cuenta en https://www.emailjs.com (gratis hasta 200 emails/mes)
2. Ve a **Email Services** → Add New Service → Gmail (o SMTP con el correo de Mariett)
3. Copia el **Service ID** → `VITE_EMAILJS_SERVICE_ID`
4. Ve a **Account** → API Keys → copia **Public Key** → `VITE_EMAILJS_PUBLIC_KEY`
5. Crea 3 templates en **Email Templates**:

### Template 1: Invitación (`VITE_EMAILJS_TEMPLATE_INVITACION`)
```
Asunto: Tu invitación al portal de coaching — Mariett Alcayaga

Hola {{to_name}},

Mariett Alcayaga te ha invitado a acceder a tu portal personal de coaching.

Tu código de acceso es: {{codigo}}

O ingresa directamente aquí: {{link_registro}}

Este código expira en 30 días.

Con cariño,
Mariett Alcayaga — Health Coach
```

### Template 2: Contrato pendiente (`VITE_EMAILJS_TEMPLATE_CONTRATO`)
```
Asunto: Tu contrato de coaching está listo para firmar

Hola {{to_name}},

Tu Acuerdo del Programa de Coaching con Mariett Alcayaga está listo.

Puedes revisarlo y firmarlo aquí: {{link_firma}}

Con cariño,
Mariett Alcayaga — Health Coach
```

### Template 3: Contrato firmado (`VITE_EMAILJS_TEMPLATE_CONTRATO_FIRMADO`)
```
Asunto: ¡Contrato firmado con éxito!

Hola {{to_name}},

Tu Acuerdo del Programa de Coaching ha sido firmado el {{fecha_firma}}.

¡Bienvenida al proceso!

Con cariño,
Mariett Alcayaga — Health Coach
```

---

## 5. Primer uso

### Configurar el coach existente (Mariett)
El usuario coach existente en Firebase Auth necesita el custom claim `role: 'coach'`.

Desde Firebase Admin SDK o la consola de Functions, ejecuta:
```javascript
admin.auth().setCustomUserClaims(UID_DE_MARIETT, { role: 'coach' })
```

O usando la Firebase Admin en Node.js local:
```bash
node -e "
const admin = require('firebase-admin')
const sa = require('./serviceAccount.json') // descarga desde Firebase Console
admin.initializeApp({ credential: admin.credential.cert(sa) })
admin.auth().setCustomUserClaims('UID_AQUI', { role: 'coach' })
  .then(() => console.log('OK'))
"
```

### Flujo de invitación de cliente
1. Coach entra a FichaCliente → Tab "Portal"
2. Clic en "Generar código de invitación"
3. Clic en "Enviar invitación por email"
4. Cliente recibe email con código y link
5. Cliente va a `/registro`, ingresa código, crea contraseña
6. Cliente accede a `/portal`

---

## 6. Deploy en Netlify

Variables de entorno a agregar en Netlify (Site settings → Environment variables):
- Todas las `VITE_*` del `.env.example`

```bash
npm run build
# o conecta el repo y Netlify hace auto-deploy
```

---

## Estructura de nuevos archivos

```
src/
├── components/
│   ├── RuedaBienestar.jsx      ← Rueda interactiva + comparación
│   ├── ContratoTab.jsx         ← Tab contrato en FichaCliente (coach)
│   ├── ContratoVisor.jsx       ← Visor HTML del contrato
│   └── PanelInvitacion.jsx     ← Gestión portal + ruedas (coach)
├── lib/
│   ├── invitaciones.js         ← Lógica de códigos Firestore
│   └── emailService.js         ← EmailJS
├── pages/
│   ├── LoginCliente.jsx        ← /login-cliente
│   ├── RegistroCliente.jsx     ← /registro
│   ├── PortalPaciente.jsx      ← /portal
│   └── ContratoFirmar.jsx      ← /contrato/:id/firmar
functions/
└── index.js                    ← Cloud Function para custom claims
firestore.rules                 ← Security Rules actualizadas
```
