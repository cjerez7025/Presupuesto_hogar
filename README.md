# Presupuesto Familiar

## Stack (sin Cloud Console, sin facturación)
- **API**: Google Apps Script Web App (ya lo tienes en el sheet)
- **Frontend**: React + Vite → Vercel
- **Base de datos**: Tu Google Sheet existente

---

## 1. Publicar el Apps Script como Web App

1. Abre tu Google Sheet
2. **Extensiones → Apps Script**
3. Crea un nuevo archivo llamado `WebApp` y pega el contenido de `WebApp.gs`
4. Click en **Implementar → Nueva implementación**
5. Tipo: **Aplicación web**
6. Configurar:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
7. Click **Implementar** → Autorizar → Copiar la URL

La URL se ve así:
```
https://script.google.com/macros/s/AKfycb.../exec
```

---

## 2. Configurar el frontend

```powershell
cd presupuesto
copy .env.example .env.local
```

Editar `.env.local`:
```
VITE_WEBAPP_URL=https://script.google.com/macros/s/TU_ID_AQUI/exec
```

---

## 3. Desarrollo local

```powershell
npm install
npm run dev
```

Abre http://localhost:3000

No necesitas terminal de API — el frontend llama directo al Apps Script.

---

## 4. Deploy en Vercel

```powershell
npm install -g vercel
vercel
```

Cuando Vercel pregunte por variables de entorno, agrega:
- `VITE_WEBAPP_URL` = tu URL del Apps Script

O en el dashboard de Vercel: Settings → Environment Variables

---

## Estructura

```
presupuesto/
├── WebApp.gs              ← Pegar en Apps Script del sheet
├── src/
│   ├── services/api.js    ← Llama al Apps Script Web App
│   ├── hooks/useStore.js
│   ├── components/
│   └── screens/
├── .env.example
├── package.json
└── vercel.json
```
