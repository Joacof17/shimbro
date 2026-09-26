// Construye assets/data/exercises.es.json a partir de:
//   - exercises.en.json        (datos crudos de free-exercise-db, en inglés)
//   - translations.es.json     (traducciones hechas por Claude en dev: { [id]: { nombre, instrucciones } })
//   - dictionaries.js          (enums cerrados: músculos, equipo, categoría, nivel, fuerza, mecánica)
//
// No hay motor de traducción por reglas ni llamadas a la API en runtime:
// todo queda horneado en el bundle para funcionar 100% offline.
//
// Uso: node scripts/build.js
const fs = require('fs');
const path = require('path');
const { MUSCLES, EQUIPMENT, CATEGORY, LEVEL, FORCE, MECHANIC } = require('./dictionaries');

// Fusiona todas las tandas de traducción de scripts/translations/*.json
// (cada una es { [id]: { nombre, instrucciones } }). Así cada tanda es un
// archivo nuevo y nunca reescribimos un JSON gigante.
function cargarTraducciones() {
  const dir = path.join(__dirname, 'translations');
  const merged = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const obj = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    Object.assign(merged, obj);
  }
  return merged;
}

const T = cargarTraducciones();

function tlist(arr, map) {
  return (arr || []).map((x) => map[x] || x);
}

function run() {
  const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'exercises.en.json'), 'utf8'));

  let faltan = 0;
  const out = src.map((ex) => {
    const tr = T[ex.id];
    if (!tr || !tr.nombre) faltan++;
    return {
      id: ex.id,
      nombre: (tr && tr.nombre) || ex.name,
      nombreOriginal: ex.name,
      fuerza: ex.force ? FORCE[ex.force] || ex.force : null,
      nivel: LEVEL[ex.level] || ex.level,
      mecanica: ex.mechanic ? MECHANIC[ex.mechanic] || ex.mechanic : null,
      equipo: EQUIPMENT[String(ex.equipment)] || ex.equipment || 'sin equipo',
      equipoClave: ex.equipment || 'none',
      musculosPrimarios: tlist(ex.primaryMuscles, MUSCLES),
      musculosSecundarios: tlist(ex.secondaryMuscles, MUSCLES),
      musculosPrimariosClave: ex.primaryMuscles || [],
      instrucciones: (tr && tr.instrucciones && tr.instrucciones.length ? tr.instrucciones : ex.instructions) || [],
      categoria: CATEGORY[ex.category] || ex.category,
      categoriaClave: ex.category,
      imagenes: ex.images || [],
    };
  });

  const outPath = path.join(__dirname, '..', 'assets', 'data', 'exercises.es.json');
  fs.writeFileSync(outPath, JSON.stringify(out));
  const traducidos = src.length - faltan;
  console.log(
    `Escritos ${out.length} ejercicios en ${outPath} (${fs.statSync(outPath).size} bytes)\n` +
      `Traducidos por Claude: ${traducidos}/${src.length}  ·  faltan: ${faltan}`
  );
}

if (require.main === module) run();
module.exports = { run };
