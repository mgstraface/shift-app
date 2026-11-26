import * as Notifications from 'expo-notifications';

const REMINDER_HOURS = 16;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Programa el aviso "¿Terminaste tu jornada?". Si el usuario no da permiso, seguimos sin aviso. */
export async function scheduleEndReminder(): Promise<string | null> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    const granted = perm.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return null;
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: '¿Terminaste tu jornada?',
        body: 'Tu jornada en SHIFT sigue abierta. Cerrala para ver tu resumen.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: REMINDER_HOURS * 3600,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelReminder(id?: string | null) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // ya disparada o inexistente
  }
}
