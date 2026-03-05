# Componentes Firebase

Los siguientes componentes están adaptados para Firebase Firestore:

## HistoriaSalud.jsx
- Usa `doc()`, `getDoc()`, `setDoc()` de Firestore
- Real-time updates con `onSnapshot()`
- Mismo formulario que versión Supabase

## Objetivos.jsx  
- Usa colección `objetivos` con cliente_id como document ID
- Real-time updates
- Formulario de 3 objetivos principales

## Sesiones.jsx
- Usa colección `sesiones` con queries por cliente_id
- Generación de PDFs editables (sin cambios)
- Eliminación de sesiones con cascada

## Diferencias clave vs Supabase:
1. `.from('tabla')` → `collection(db, 'coleccion')`
2. `.select()` → `getDocs(query(...))`
3. `.insert()` → `addDoc()` o `setDoc()`
4. `.update()` → `updateDoc()`
5. `.delete()` → `deleteDoc()`
6. Real-time: `onSnapshot()` en vez de polling

Todos mantienen la misma UI/UX.
