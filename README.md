# 🏋️ Shimbro — Seguidor de rutinas de gimnasio

App mobile (Expo / React Native) para armar rutinas, entrenarlas registrando pesos semana a semana, y seguir rutinas por objetivo. Catálogo de **873 ejercicios traducidos al español**, con imágenes on-demand. Todo se guarda **localmente en el dispositivo** (sin cuentas ni servidores).

## Cómo correr la app

### En el simulador de iPhone (requiere Xcode)
1. Instalá **Xcode** (gratis desde la Mac App Store).
2. Seleccioná las herramientas de Xcode:
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```
3. Arrancá la app:
   ```bash
   npx expo start --ios
   ```

### En tu iPhone/Android real (sin Xcode)
1. Instalá la app **Expo Go** desde la App Store / Play Store.
2. En la compu:
   ```bash
   npx expo start
   ```
3. Escaneá el QR con la cámara (iOS) o con Expo Go (Android).

### En el navegador (vista rápida)
```bash
npx expo start --web
```

## Funcionalidades

- **Configurar rutina**: rutinas con hasta 6 días (n < 7) y libre cantidad de ejercicios.
  - Agregado rápido **por grupo muscular** (17 grupos) o **buscador por nombre**.
  - **Ejercicio de texto libre** para inventar uno propio.
  - Series y repeticiones editables por ejercicio.
- **Comenzar rutina**: elegís el día; ves cuáles ya hiciste esta semana y cuál es el
  **siguiente sugerido** (podés elegir cualquiera igual). Al entrenar, ves el **peso de la
  semana pasada**, cargás el de hoy y elegís **mancuerna / barra / peso corporal**.
- **Entrenamiento personalizado**: rutinas por objetivo (salto vertical, velocidad, core,
  movilidad, espalda sana, potencia de empuje, glúteos), con técnica y por qué ayudan.
  Se pueden **guardar como rutina propia** para registrar pesos.

## Arquitectura

```
App.tsx                    Navegación (stack) + proveedor de estado
src/
  theme.ts                 Colores, tipografía, espaciado
  types.ts                 Tipos del dominio
  store.tsx                Estado global + persistencia (AsyncStorage)
  navigation.ts            Tipos de rutas
  utils.ts                 Utilidades (id único, fechas)
  components/ui.tsx        Componentes reutilizables
  data/
    catalogo.ts            Carga del catálogo, búsqueda, grupos musculares, imágenes
    personalizadas.ts      Rutinas por objetivo (diseñadas a mano)
  screens/                 Las 8 pantallas
assets/data/
  exercises.es.json        Catálogo traducido (generado)
scripts/                   Pipeline de traducción (ver abajo)
```

## Datos y traducción

- **Fuente**: [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (MIT, gratis, sin API key).
  Se eligió sobre la ExerciseDB de RapidAPI porque esa requiere una clave de pago; esta es
  equivalente e incluye instrucciones paso a paso e imágenes estáticas.
- **Imágenes**: on-demand vía CDN jsDelivr (`cdn.jsdelivr.net/gh/yuhonas/free-exercise-db`).
- **Traducción** (`scripts/`): motor de reglas EN→ES.
  - Categorías, músculos, equipos, niveles: traducción exacta.
  - Nombres: clasificador de tokens con reordenamiento gramatical
    (ej. *"Barbell Bench Press"* → *"Press de banca con barra"*).
  - Instrucciones: oraciones frecuentes + frases + diccionario de palabras
    (~95% del texto queda en español; la prosa larga puede tener alguna imperfección).
  - Regenerar: `node scripts/translate.js`

## Notas

- El estado se guarda bajo la clave `shimbro:estado:v1` (AsyncStorage / localStorage en web).
- `App.tsx` expone `globalThis.__nav` (referencia de navegación) — sólo un apoyo de desarrollo, inofensivo.
