# Tablero Basketball

App Android de control de partidos de basketball (marcador, reloj por cuartos, faltas/bonus, tiempos muertos). Empezó como un prototipo de un solo archivo HTML (`docs/prototype.html`, referencia de diseño) y se migró a una app Vue 3 + Capacitor instalable en Android.

## Stack

- **Vue 3** (Composition API, `<script setup>`), JavaScript (no TypeScript).
- **Vite** como build tool.
- **Capacitor 8** (plataforma Android) — plugins: `@capacitor/preferences`, `@capacitor/device`, `@capacitor/haptics`, `@capacitor-community/keep-awake`.
- **vue-i18n** para internacionalización (es/en/de/fr/pt).

## Convenciones

- **Estado global**: `src/state/gameState.js` es un composable singleton (un `reactive()` de módulo, no Pinia). Toda la lógica del reloj, marcador, faltas, tiempos muertos y modales vive ahí. Los componentes importan y llaman sus funciones directamente, sin prop-drilling.
- **i18n**: `src/locales/es.json` es la referencia de claves. Cualquier clave nueva debe agregarse en los **5** idiomas (`es`, `en`, `de`, `fr`, `pt`) o vue-i18n caerá al fallback (`en`) para los idiomas que falten esa clave.
- **Nombres de idioma** (para el selector en el modal de configuración) están en `src/state/languageNames.js`, separados de los JSON de traducción porque el nombre de un idioma en sí mismo no depende del locale activo (p. ej. "Deutsch" siempre se llama "Deutsch").
- **CSS**: `src/style.css` es global (no scoped), portado casi literal del prototipo original para no alterar el diseño. Los componentes reutilizan esas mismas clases (`.topbar`, `.team`, `.score`, `.modal`, etc.) en vez de definir estilos propios.
- **Persistencia**: se usa `@capacitor/preferences` en vez de `localStorage`. El estado completo del partido se guarda bajo la clave `bball-proto-v1`; el idioma elegido, bajo `bball-lang`. El guardado del reloj está *throttleado* a ~1 vez por segundo (en vez de en cada tick de 120ms) para no saturar el storage nativo — el reloj en pantalla sigue actualizándose cada 120ms igual.

## Comandos

```bash
npm install              # instalar dependencias
npm run dev               # servidor de desarrollo web (sin plugins nativos reales; útil para iterar UI rápido)
npm run build              # build de producción a dist/
npx cap sync android        # copiar dist/ al proyecto Android y registrar plugins nativos
npx cap open android         # abrir el proyecto en Android Studio
npx cap run android           # compilar e instalar en un dispositivo/emulador conectado
```

Después de cualquier cambio en `src/` que se vaya a probar en Android, correr `npm run build && npx cap sync android` (o solo `npx cap sync android`, que ya corre el build de web si está configurado, pero es más explícito hacerlo en dos pasos).

### Build de Android por línea de comandos (importante)

Capacitor 8 / Android Gradle Plugin requieren **JDK 21**. El JDK del sistema en esta máquina es 19, así que `./gradlew` por CLI necesita `JAVA_HOME` apuntando al JDK embebido de Android Studio:

```bash
cd android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew assembleDebug
```

Abrir el proyecto *desde* Android Studio no tiene este problema: la IDE usa su propio JDK embebido automáticamente.

## Abrir en Android Studio

```bash
npx cap open android
```

Espera a que termine el Gradle sync inicial (puede tardar varios minutos la primera vez). El `applicationId` (`cl.midominio.tablero`), el nombre de la app y el ícono/splash ya están configurados.

## Probar en un dispositivo físico

1. En el teléfono: **Ajustes → Acerca del teléfono** → tocar 7 veces "Número de compilación" para habilitar Opciones de desarrollador.
2. **Ajustes → Opciones de desarrollador** → activar **Depuración USB**.
3. Conectar el teléfono por USB y aceptar el diálogo de confianza que aparece en el teléfono.
4. Verificar que se detecta: `adb devices` (con `$ANDROID_HOME/platform-tools` en el `PATH`, o usando la ruta completa `~/Library/Android/sdk/platform-tools/adb devices`).
5. Instalar y correr:
   - Desde Android Studio: botón ▶ (Run), eligiendo el dispositivo en la lista.
   - O por CLI: `npx cap run android --target <deviceId>` (el `deviceId` sale de `adb devices`).

La orientación queda fija en **landscape** (`AndroidManifest.xml`, `MainActivity`), así que el teléfono debe sostenerse horizontal para usar la app.

## Regenerar ícono y splash

Los archivos fuente están en `resources/icon.png` (1024×1024) y `resources/splash.png` (2732×2732) — actualmente un placeholder simple (balón naranja `#e8590c` sobre fondo oscuro `#101623`, los colores del propio diseño). Para reemplazarlos por arte definitivo: sobrescribir esos dos PNG y correr:

```bash
npx capacitor-assets generate --android
npx cap sync android
```

## Prototipo original

`docs/prototype.html` es el HTML de un solo archivo del que partió este proyecto — se conserva como referencia de diseño y comportamiento, pero no forma parte del build.
