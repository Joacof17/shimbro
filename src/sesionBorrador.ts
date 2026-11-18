// Borrador de sesión en curso: guarda temporalmente lo que el usuario va cargando
// mientras entrena, para que si cierra o cambia de app a la mitad pueda reanudar.
// En web, AsyncStorage usa localStorage (persiste al cerrar la pestaña); en nativo, su
// almacenamiento propio. El borrador se limpia al finalizar la sesión.
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIJO = 'shimbro:borrador:';

export async function leerBorrador<T>(clave: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIJO + clave);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function guardarBorrador(clave: string, data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIJO + clave, JSON.stringify(data));
  } catch {
    // almacenamiento no disponible (modo privado, etc.): seguir sin romper.
  }
}

export async function limpiarBorrador(clave: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIJO + clave);
  } catch {
    // ignorar
  }
}
