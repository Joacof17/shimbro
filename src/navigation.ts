// Tipos de navegación.
export type RootStackParamList = {
  Home: undefined;
  ConfigurarRutina: undefined;
  EditorRutina: { rutinaId: string };
  SelectorEjercicios: { rutinaId: string; diaId: string };
  ComenzarRutina: undefined;
  DiaEntrenamiento: { rutinaId: string; diaId: string };
  Personalizado: undefined;
  PersonalizadoDetalle: { rutinaId: string };
  EntrenarPlan: { planId: string };
  EjercicioDetalle: { ejercicioId: string };
};
