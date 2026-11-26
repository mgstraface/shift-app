# SHIFT — Powered by YUNITEX

App móvil (iOS + Android) que registra la actividad de los profesionales de la salud durante su jornada y la vincula con su ambo. *Cada jornada cuenta.*

## Estado: semana 1 (base técnica)

- [x] Proyecto Expo + Expo Router + TypeScript
- [x] Capa de salud: HealthKit (iOS) y Health Connect (Android) detrás de una interfaz común (`src/health`)
- [x] Iniciar / ver / finalizar jornada, con persistencia local (sobrevive a cerrar la app o reiniciar el celular)
- [x] Resumen de jornada, valoración de confort, reconsulta de datos ("Actualizar datos")
- [x] Historial local y resumen de los últimos 7 días
- [x] Aviso a las 16 h si la jornada quedó abierta
- [ ] Semana 2: ambos por QR, `shift-api`, historias para compartir

## Primera vez

Requisitos: Node 20+, cuenta de Expo (`npx eas-cli login`), y para iOS la cuenta de Apple Developer.

```sh
npm run setup          # instala dependencias con las versiones del SDK de Expo
npx eas-cli init       # vincula el proyecto con tu cuenta de Expo (una sola vez)
```

> La app usa módulos nativos (HealthKit, Health Connect): **no funciona en Expo Go**. Hace falta una development build.

## Development build en tu celular

```sh
npm run build:dev:android   # genera un APK de desarrollo, se instala desde el link de EAS
npm run build:dev:ios       # requiere registrar el iPhone: npx eas-cli device:create
npm start                   # levanta Metro; abrí la app SHIFT de desarrollo y conectate
```

Alternativa local (con Android Studio / Xcode instalados): `npm run android` o `npm run ios`.

## Qué probar en la semana 1

1. Onboarding → "Conectar con Salud / Health Connect" → aceptar pasos y distancia.
2. Iniciar jornada, cerrar la app, caminar un rato, volver: el cronómetro y los pasos tienen que seguir.
3. Finalizar jornada → comparar los pasos con los de la app Salud / Samsung Health / Health Connect para el mismo horario.
4. Probar con reloj y sin reloj. Probar dejando el celular quieto 2 h (tiene que aparecer el aviso de datos parciales).
5. Android: probar en un celular con Android 14+ y, si hay, en uno más viejo.

Anotá cualquier diferencia de pasos entre SHIFT y la app de salud: es lo más importante a validar.

## Estructura

```
app/                 pantallas (Expo Router)
  (tabs)/            Inicio, Historial, Mis ambos, Perfil
  onboarding.tsx     permisos de salud
  shift/active.tsx   jornada en curso
  shift/[id].tsx     resumen de jornada
src/
  health/            interfaz común + provider.ios.ts + provider.android.ts
  shift/             tipos, persistencia, lógica de jornada, hooks
  ui/                tema (paleta provisoria) y componentes
  lib/               formato y utilidades
```

## Reglas del producto que el código respeta

- **Nunca inventar métricas.** Sin datos se muestra "—" y un aviso, no un 0.
- Se usan las consultas **agregadas** de cada plataforma, que no duplican pasos entre celular y reloj.
- Los datos de salud se leen en el celular. Al servidor (semana 2) solo suben resúmenes, con consentimiento.
- Sin GPS, sin rankings, sin incentivar jornadas más largas.
