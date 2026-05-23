# 🏠 Familia Tracker

Rastreador de ubicación familiar. Gratuito, privado, sin anuncios.

## Cómo funciona

- **Tú** abres el panel en `tu-url.railway.app` y ves el mapa con todos.
- **Tus familiares** abren un link en su navegador y activan el rastreo con un botón.
- La ubicación se manda cada **5 minutos** (muy poco consumo de datos y batería).

---

## Cómo subirlo a Railway (gratis)

### Paso 1 — Crea cuenta en Railway
1. Entra a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub (necesitas una cuenta GitHub)

### Paso 2 — Sube el código a GitHub
1. Entra a [github.com](https://github.com) → New repository → nombre: `familia-tracker`
2. Sube todos estos archivos (arrastra la carpeta o usa GitHub Desktop)

### Paso 3 — Despliega en Railway
1. En Railway → **New Project** → **Deploy from GitHub repo**
2. Selecciona tu repositorio `familia-tracker`
3. Railway detecta automáticamente que es Node.js y lo instala

### Paso 4 — Configura la clave de admin
1. En Railway → tu proyecto → **Variables**
2. Agrega: `ADMIN_KEY` = (la clave que quieras, ej: `miClave2024`)
3. Railway reinicia automáticamente

### Paso 5 — Obtén tu URL pública
1. En Railway → tu proyecto → **Settings** → **Networking** → **Generate Domain**
2. Te da una URL tipo `familia-tracker-abc123.railway.app`

---

## Cómo usarlo

### Agregar un familiar
1. Abre `tu-url.railway.app` en tu celular
2. Pon tu clave de admin
3. Ve a **Gestionar** → escribe el nombre → **Crear y copiar link**
4. Manda ese link por WhatsApp a tu familiar

### Tu familiar
1. Abre el link en su navegador (Chrome, Safari)
2. Toca **Activar rastreo** y acepta el permiso de ubicación
3. Listo. Manda su posición cada 5 minutos automáticamente.
4. Puede cerrar la pantalla pero NO la pestaña del navegador.

### Ver el mapa
- Abre `tu-url.railway.app` con tu clave
- El mapa se actualiza cada 30 segundos
- Toca un nombre en el panel para centrar el mapa en esa persona

---

## Notas importantes

- **iPhone**: Safari pide permiso de ubicación cada vez que se recarga la página, es normal.
- **Android**: Chrome mantiene el permiso. Funciona mejor.
- **Batería**: Usa modo "Solo red" (no GPS preciso) para ahorrar batería. El error es de ±100-300m, suficiente para saber en qué zona está.
- **Datos**: ~1-3 MB al día por familiar. Muy poco.
- **Privacidad**: Solo tú tienes la clave. Nadie más puede ver el mapa.

## Estructura del proyecto

```
familia-tracker/
├── server.js          ← Servidor principal
├── package.json       ← Dependencias
├── railway.json       ← Configuración de despliegue
├── db/                ← Base de datos SQLite (se crea automáticamente)
└── public/
    ├── index.html     ← Panel de admin (mapa)
    └── rastrear.html  ← Página del familiar
```
