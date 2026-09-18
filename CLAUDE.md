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

Espera a que termine el Gradle sync inicial (puede tardar varios minutos la primera vez). El `applicationId` (`cl.chenriquez.tablero`), el nombre de la app y el ícono/splash ya están configurados.

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

Los archivos fuente están en `resources/icon.png` (1024×1024) y `resources/splash.png` (2732×2732): un balón de basketball (naranja `#e8590c` sobre fondo oscuro `#101623`, los colores del propio diseño) con "24" en ámbar (`#ffb84d`, el mismo color del reloj de la app) debajo, aludiendo al reloj de posesión. El patrón de costuras del balón usa el path del ícono "basketball" de [Font Awesome Free](https://fontawesome.com/icons/basketball) (CC BY 4.0, © Fonticons Inc.), reescalado y recoloreado. Para reemplazar el ícono/splash por arte propio: sobrescribir esos dos PNG y correr:

```bash
npx capacitor-assets generate --android
npx cap sync android
```

## Build de release firmado

Para generar un APK firmado que se pueda compartir e instalar en cualquier Android (sin pasar por Play Store):

- El keystore vive en `~/keystores/tablero-basketball.jks` (fuera del repo, **solo en esta Mac** — no está en git ni tiene backup automático; conviene respaldarlo en algún gestor de contraseñas o almacenamiento seguro, porque si se pierde no se puede volver a firmar una actualización con la misma identidad).
- Las credenciales están en `android/keystore.properties` (gitignored, nunca se commitea). Si ese archivo no existe, el build de release sale **sin firmar**.
- Formato de ese archivo:
  ```properties
  storeFile=/Users/carlos/keystores/tablero-basketball.jks
  storePassword=...
  keyAlias=tablero-basketball
  keyPassword=...
  ```
  (con un keystore PKCS12 — el formato por defecto de `keytool` hoy — `storePassword` y `keyPassword` son siempre iguales).

Compilar:

```bash
npm run build
npx cap sync android
cd android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew assembleRelease
```

El APK queda en `android/app/build/outputs/apk/release/app-release.apk`. Para compartirlo, basta con enviar ese archivo (WhatsApp, Drive, USB, etc.); quien lo reciba necesita habilitar "Instalar apps desconocidas" para la app desde la que lo abra, ya que no viene de Play Store.

Recordar subir `versionCode`/`versionName` en `android/app/build.gradle` en cada release nueva — Android no deja instalar una versión con el mismo `versionCode` encima de una ya instalada.

## Publicar en Google Play

Google Play exige **AAB**, no APK:

```bash
cd android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
./gradlew bundleRelease
```

Queda en `android/app/build/outputs/bundle/release/app-release.aab` (usa el mismo `keystore.properties` que el APK de release).

Los assets de la ficha de la tienda (ícono 512×512, feature graphic, capturas de pantalla reales del teléfono, descripciones corta/larga) están en [`docs/store/`](docs/store/listing.md). La política de privacidad vive en un Artifact publicado — el link está en ese mismo archivo; si se actualiza, hay que reflejarlo ahí también.

## Prototipo original

`docs/prototype.html` es el HTML de un solo archivo del que partió este proyecto — se conserva como referencia de diseño y comportamiento, pero no forma parte del build.
