#!/bin/sh
# Instala las dependencias con las versiones compatibles con el SDK de Expo instalado.
# Correr una sola vez después de clonar (o cuando se agregue una dependencia nueva acá).
set -e

npm install

npx expo install \
  react react-dom react-native \
  expo-router expo-linking expo-constants expo-status-bar \
  react-native-safe-area-context react-native-screens \
  expo-dev-client expo-sqlite expo-notifications expo-build-properties \
  @kingstinct/react-native-healthkit react-native-nitro-modules \
  react-native-health-connect

npx expo install typescript @types/react -- --save-dev

npx expo install --fix

echo ""
echo "Listo. Commiteá package.json y package-lock.json."
