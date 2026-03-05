# 🚀 Plan de Implementación Completo - Firebase

## ✅ Ya completado (80%):
1. Configuración Firebase
2. AuthContext
3. Login
4. Dashboard con eliminación
5. NuevoCliente
6. FichaCliente
7. App.jsx
8. PDF Generator (sesiones)

## 🔧 En progreso ahora:

### Fase 1: Componentes Firebase (1-2 horas)
- [ ] HistoriaSalud.jsx adaptado a Firebase
- [ ] Objetivos.jsx adaptado a Firebase
- [ ] Sesiones.jsx adaptado a Firebase

### Fase 2: Sistema de Contratos (1 hora)
- [ ] contractGenerator.js - Generador de PDF
- [ ] Contrato.jsx - Componente con formulario
- [ ] Integración en FichaCliente (Tab)
- [ ] Botón rápido en Dashboard
- [ ] Storage en Firestore:
  ```
  contratos/
    {contratoId}/
      - cliente_id
      - numero_sesiones
      - monto
      - fecha_acuerdo
      - firmado (boolean)
      - fecha_firma (timestamp)
      - tipo_firma ('fisica' | 'digital')
      - created_at
  ```

### Fase 3: Firma Digital (30 min)
- [ ] Modal de firma
- [ ] Estado "Firmado" vs "Pendiente"
- [ ] Historial de contratos

## 📦 Estructura final:

```
src/
├── lib/
│   ├── firebase.js
│   ├── pdfGenerator.js (sesiones)
│   └── contractGenerator.js (NUEVO - contratos)
├── components/
│   ├── HistoriaSalud.jsx (ACTUALIZADO)
│   ├── Objetivos.jsx (ACTUALIZADO)
│   ├── Sesiones.jsx (ACTUALIZADO)
│   └── Contrato.jsx (NUEVO)
└── pages/
    ├── Dashboard.jsx (ACTUALIZADO - botón contrato)
    └── FichaCliente.jsx (ACTUALIZADO - tab contrato)
```

## 🎯 Funcionalidades Contrato:

1. **Generación automática**
   - Pre-llena nombre del cliente
   - Logo de Mariett
   - Campos editables en PDF

2. **Dos modos de firma**
   - Física: Genera PDF, imprime, firma manual
   - Digital: Marca como firmado en el sistema

3. **Storage en Firestore**
   - Guarda historial de contratos
   - Estado de firma
   - Fecha de acuerdo

4. **Acceso rápido**
   - Tab en ficha del cliente
   - Botón en Dashboard

## ⏱️ Tiempo total estimado: 2.5-3 horas

Comenzando implementación...
