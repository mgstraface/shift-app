export type HealthAvailability =
  | 'available'
  | 'not_installed' // Android: Health Connect no está instalado
  | 'needs_update' // Android: hay que actualizar Health Connect
  | 'unsupported'; // dispositivo o plataforma sin datos de salud

export interface ShiftMetrics {
  /** null = la plataforma no devolvió datos (nunca inventamos un 0). */
  steps: number | null;
  distanceMeters: number | null;
  /** Apps o dispositivos que aportaron datos (iPhone, Apple Watch, Samsung Health...). */
  sources: string[];
}

export interface HealthProvider {
  platformName: string;
  availability(): Promise<HealthAvailability>;
  /** Pide permisos de lectura. Devuelve true si el sistema aceptó el pedido (en iOS no sabemos si el usuario los negó). */
  requestPermissions(): Promise<boolean>;
  /** Abre la configuración donde el usuario puede revisar los permisos. */
  openSettings(): Promise<void>;
  /** Abre la tienda para instalar o actualizar el proveedor de salud (solo Android). */
  openInstall?(): Promise<void>;
  /** Métricas agregadas (sin duplicados entre celular y reloj) del intervalo. */
  getMetrics(start: Date, end: Date): Promise<ShiftMetrics>;
  /** Información cruda para depurar: permisos, respuesta de la plataforma y errores. */
  diagnose(): Promise<Record<string, unknown>>;
}
