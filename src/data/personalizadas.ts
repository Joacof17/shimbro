// Rutinas de entrenamiento personalizado diseñadas por objetivo.
// Cada ejercicio se enlaza al catálogo mediante `buscar` (se resuelve a la
// mejor coincidencia para reusar imagen e instrucciones); si no hay match,
// se muestra igual con su descripción.

export type EjPersonalizado = {
  nombre: string;
  buscar?: string; // término para enlazar con el catálogo
  series: string;
  reps: string;
  nota: string; // pista técnica / por qué ayuda al objetivo
};

export type RutinaPersonalizada = {
  id: string;
  titulo: string;
  emoji: string;
  objetivo: string;
  descripcion: string;
  nivel: string;
  frecuencia: string;
  color: string;
  ejercicios: EjPersonalizado[];
};

export const RUTINAS_PERSONALIZADAS: RutinaPersonalizada[] = [
  {
    id: 'salto',
    titulo: 'Salto vertical',
    emoji: '🦘',
    objetivo: 'Saltar más alto',
    descripcion:
      'Combina fuerza de piernas con potencia explosiva (pliometría). La clave del salto es aplicar mucha fuerza en muy poco tiempo.',
    nivel: 'Intermedio',
    frecuencia: '2-3 veces por semana',
    color: '#E0863C',
    ejercicios: [
      { nombre: 'Sentadilla con barra', buscar: 'barbell squat', series: '4', reps: '5', nota: 'Base de fuerza. Bajá controlado y subí con intención explosiva.' },
      { nombre: 'Salto al cajón', buscar: 'box jump', series: '5', reps: '3', nota: 'Máxima potencia. Aterrizá suave y estable, descansá entre saltos.' },
      { nombre: 'Empuje de cadera', buscar: 'hip thrust', series: '4', reps: '8', nota: 'Glúteos fuertes = más impulso hacia arriba.' },
      { nombre: 'Zancada búlgara', buscar: 'split squat', series: '3', reps: '8 por pierna', nota: 'Corrige desbalances entre piernas y estabiliza el aterrizaje.' },
      { nombre: 'Salto largo', buscar: 'long jump', series: '4', reps: '4', nota: 'Transfiere potencia horizontal; medí la distancia para progresar.' },
      { nombre: 'Elevación de gemelos', buscar: 'calf raise', series: '3', reps: '12-15', nota: 'El tobillo es el último eslabón del salto: reactividad y despegue.' },
    ],
  },
  {
    id: 'velocidad',
    titulo: 'Velocidad / Sprint',
    emoji: '⚡',
    objetivo: 'Correr más rápido',
    descripcion:
      'Fuerza de cadena posterior, potencia unilateral y estabilidad para trasladar fuerza al suelo en cada zancada.',
    nivel: 'Intermedio',
    frecuencia: '2-3 veces por semana',
    color: '#F2C63D',
    ejercicios: [
      { nombre: 'Peso muerto rumano', buscar: 'romanian deadlift', series: '4', reps: '6-8', nota: 'Isquiotibiales y glúteos, motores de la velocidad.' },
      { nombre: 'Zancada caminando', buscar: 'walking lunge', series: '3', reps: '10 por pierna', nota: 'Potencia y estabilidad unilateral, como al correr.' },
      { nombre: 'Salto al cajón', buscar: 'box jump', series: '5', reps: '3', nota: 'Reclutamiento explosivo de fibras rápidas.' },
      { nombre: 'Curl femoral', buscar: 'leg curl', series: '3', reps: '10-12', nota: 'Protege el isquiotibial de tirones en el sprint.' },
      { nombre: 'Elevación de gemelos', buscar: 'calf raise', series: '4', reps: '12', nota: 'Rigidez del tobillo para un rebote más eficiente.' },
      { nombre: 'Plancha', buscar: 'plank', series: '3', reps: '30-45 seg', nota: 'Un core firme evita fugas de energía al correr.' },
    ],
  },
  {
    id: 'core',
    titulo: 'Core de acero',
    emoji: '🧱',
    objetivo: 'Abdomen y estabilidad',
    descripcion:
      'Trabaja el core en sus tres funciones: anti-extensión, anti-rotación y flexión. Un core fuerte protege la espalda y mejora todo lo demás.',
    nivel: 'Principiante',
    frecuencia: '3-4 veces por semana',
    color: '#C15D3C',
    ejercicios: [
      { nombre: 'Plancha', buscar: 'plank', series: '3', reps: '30-60 seg', nota: 'Anti-extensión. Glúteos y abdomen apretados, sin hundir la cadera.' },
      { nombre: 'Elevación de piernas colgado', buscar: 'hanging leg raise', series: '3', reps: '8-12', nota: 'Abdominal inferior. Evitá balancearte.' },
      { nombre: 'Giro ruso', buscar: 'russian twist', series: '3', reps: '16 total', nota: 'Oblicuos y anti-rotación.' },
      { nombre: 'Plancha lateral', buscar: 'side plank', series: '3', reps: '20-30 seg por lado', nota: 'Estabilidad lateral y oblicuos profundos.' },
      { nombre: 'Crunch en polea', buscar: 'cable crunch', series: '3', reps: '12-15', nota: 'Flexión con carga progresiva para el recto abdominal.' },
    ],
  },
  {
    id: 'movilidad',
    titulo: 'Movilidad y flexibilidad',
    emoji: '🧘',
    objetivo: 'Moverte mejor y sin dolor',
    descripcion:
      'Rutina de estiramientos y movilidad para caderas, isquiotibiales, columna y hombros. Ideal para días de descanso o al terminar de entrenar.',
    nivel: 'Todos',
    frecuencia: 'Diario o post-entreno',
    color: '#7C9CF0',
    ejercicios: [
      { nombre: 'Estiramiento de isquiotibiales', buscar: 'hamstring stretch', series: '2', reps: '30 seg por lado', nota: 'Sin rebotes; buscá tensión, no dolor.' },
      { nombre: 'Estiramiento de cuádriceps', buscar: 'quad stretch', series: '2', reps: '30 seg por lado', nota: 'Mantené las rodillas juntas.' },
      { nombre: 'Estiramiento de flexores de cadera', buscar: 'hip flexor stretch', series: '2', reps: '30 seg por lado', nota: 'Clave si pasás muchas horas sentado.' },
      { nombre: 'Rotación torácica', series: '2', reps: '8 por lado', nota: 'Devuelve movilidad a la espalda alta.' },
      { nombre: 'Estiramiento de hombros', buscar: 'shoulder stretch', series: '2', reps: '30 seg por lado', nota: 'Mejora el rango para press por encima de la cabeza.' },
    ],
  },
  {
    id: 'espalda-sana',
    titulo: 'Espalda sana y postura',
    emoji: '🪷',
    objetivo: 'Cuidar la zona lumbar',
    descripcion:
      'Fortalece el core profundo, los glúteos y la cadena posterior para proteger la zona lumbar y mejorar la postura al estar sentado.',
    nivel: 'Principiante',
    frecuencia: '3 veces por semana',
    color: '#5FB58C',
    ejercicios: [
      { nombre: 'Puente de glúteos', buscar: 'glute bridge', series: '3', reps: '12-15', nota: 'Activa glúteos sin cargar la lumbar.' },
      { nombre: 'Perro de caza', series: '3', reps: '10 por lado', nota: 'Estabilidad y coordinación de la columna.' },
      { nombre: 'Superman', buscar: 'superman', series: '3', reps: '12', nota: 'Fortalece los erectores espinales.' },
      { nombre: 'Plancha', buscar: 'plank', series: '3', reps: '30 seg', nota: 'Core firme que sostiene la columna.' },
      { nombre: 'Buenos días', buscar: 'good morning', series: '3', reps: '10-12', nota: 'Enseña a mover la cadera y no la espalda. Empezá liviano.' },
    ],
  },
  {
    id: 'potencia-tren-superior',
    titulo: 'Potencia de empuje',
    emoji: '💥',
    objetivo: 'Tren superior explosivo',
    descripcion:
      'Para lanzar, empujar o golpear con más fuerza. Mezcla fuerza de press con trabajo explosivo de pecho, hombros y tríceps.',
    nivel: 'Intermedio',
    frecuencia: '2 veces por semana',
    color: '#F0562A',
    ejercicios: [
      { nombre: 'Press de banca con barra', buscar: 'barbell bench press', series: '4', reps: '5', nota: 'Base de fuerza de empuje.' },
      { nombre: 'Flexión de brazos explosiva', buscar: 'plyo push', series: '4', reps: '5', nota: 'Buscá despegar las manos del suelo.' },
      { nombre: 'Press de hombros', buscar: 'overhead press', series: '3', reps: '6-8', nota: 'Fuerza por encima de la cabeza.' },
      { nombre: 'Lanzamiento de balón medicinal', buscar: 'medicine ball throw', series: '4', reps: '6', nota: 'Transferencia directa a la potencia real.' },
      { nombre: 'Fondos', buscar: 'triceps dip', series: '3', reps: '8-12', nota: 'Tríceps y pecho bajo.' },
    ],
  },
  {
    id: 'gluteos-piernas',
    titulo: 'Glúteos y piernas',
    emoji: '🍑',
    objetivo: 'Tren inferior fuerte',
    descripcion:
      'Rutina completa de piernas con foco en glúteos: fuerza, volumen y estabilidad para un tren inferior potente y equilibrado.',
    nivel: 'Intermedio',
    frecuencia: '2-3 veces por semana',
    color: '#F1899E',
    ejercicios: [
      { nombre: 'Sentadilla con barra', buscar: 'barbell squat', series: '4', reps: '6-8', nota: 'Rey de los ejercicios de pierna.' },
      { nombre: 'Empuje de cadera', buscar: 'hip thrust', series: '4', reps: '10-12', nota: 'Máxima activación de glúteo.' },
      { nombre: 'Peso muerto rumano', buscar: 'romanian deadlift', series: '3', reps: '8-10', nota: 'Isquiotibiales y glúteo, control en la bajada.' },
      { nombre: 'Zancada búlgara', buscar: 'bulgarian split squat', series: '3', reps: '10 por pierna', nota: 'Estabilidad y volumen unilateral.' },
      { nombre: 'Elevación de gemelos', buscar: 'calf raise', series: '4', reps: '12-15', nota: 'Completá el desarrollo de la pierna.' },
    ],
  },
];
