// Diccionarios de traducción EN -> ES para datos de ejercicios.
// Categorías cerradas (traducción perfecta):

const MUSCLES = {
  abdominals: 'abdominales',
  hamstrings: 'isquiotibiales',
  adductors: 'aductores',
  quadriceps: 'cuádriceps',
  biceps: 'bíceps',
  shoulders: 'hombros',
  chest: 'pecho',
  'middle back': 'espalda media',
  calves: 'gemelos',
  glutes: 'glúteos',
  'lower back': 'espalda baja',
  lats: 'dorsales',
  triceps: 'tríceps',
  traps: 'trapecios',
  forearms: 'antebrazos',
  neck: 'cuello',
  abductors: 'abductores',
};

const EQUIPMENT = {
  'body only': 'peso corporal',
  machine: 'máquina',
  other: 'otro',
  'foam roll': 'rodillo de espuma',
  kettlebells: 'pesas rusas',
  dumbbell: 'mancuerna',
  cable: 'polea',
  barbell: 'barra',
  bands: 'bandas',
  'medicine ball': 'balón medicinal',
  'exercise ball': 'pelota de ejercicio',
  'e-z curl bar': 'barra Z',
  null: 'sin equipo',
};

const CATEGORY = {
  strength: 'fuerza',
  stretching: 'estiramiento',
  plyometrics: 'pliometría',
  strongman: 'strongman',
  powerlifting: 'powerlifting',
  cardio: 'cardio',
  'olympic weightlifting': 'halterofilia',
};

const LEVEL = {
  beginner: 'principiante',
  intermediate: 'intermedio',
  expert: 'avanzado',
};

const FORCE = {
  push: 'empuje',
  pull: 'tracción',
  static: 'estático',
};

const MECHANIC = {
  compound: 'compuesto',
  isolation: 'aislamiento',
};

module.exports = { MUSCLES, EQUIPMENT, CATEGORY, LEVEL, FORCE, MECHANIC };
