// Generador de traducciones (build-time, se corre UNA sola vez en desarrollo).
//
// Traduce nombre + instrucciones de cada ejercicio de exercises.en.json al
// español (rioplatense, voseo) usando la API de Claude, y cachea el resultado
// en scripts/translations/api-*.json. Después, `node scripts/build.js` fusiona
// todo en assets/data/exercises.es.json y queda horneado en el bundle.
//
// >>> La APP NO llama a la API en runtime. Esto es solo para generar los datos. <<<
//
// Requisitos:
//   npm install -D @anthropic-ai/sdk
//   export ANTHROPIC_API_KEY=sk-ant-...   (o `ant auth login`)
// Uso:
//   node scripts/translate-claude.js            # traduce lo que falte (reanudable)
//   node scripts/translate-claude.js --limit 40 # solo 40 (para probar)

const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// Modelo por defecto: Opus 5 (máxima calidad). Para una traducción masiva más
// barata podés cambiarlo a 'claude-sonnet-5' o 'claude-haiku-4-5'.
const MODEL = process.env.SHIMBRO_MODEL || 'claude-opus-5';
const BATCH = 8; // ejercicios por request
const CONCURRENCIA = 3; // requests en paralelo

const DIR = path.join(__dirname, 'translations');

const SYSTEM = `Sos un traductor experto de fitness al español rioplatense (Argentina, voseo).
Traducís nombres e instrucciones de ejercicios de gimnasio del inglés al español.

Reglas:
- Usá voseo natural en imperativo (recostate, empujá, mantené, sostené, bajá, subí).
- Terminología de gym correcta y natural; mantené préstamos usados tal cual (curl, press, sprint, plancha, burpee, peso muerto, sentadilla, dominada, flexión).
- Convertí unidades imperiales a métricas de forma natural (pulgadas→cm, libras→kg, pies→m), redondeando razonable.
- Mantené el MISMO número de pasos de instrucciones que el original (uno a uno).
- Español claro y conciso, sin inventar información.
- Devolvé EXCLUSIVAMENTE un JSON válido, sin texto extra ni markdown.`;

function cargarHechos() {
  const done = new Set();
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith('.json')) continue;
    const obj = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    Object.keys(obj).forEach((id) => done.add(id));
  }
  return done;
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function parseJSON(texto) {
  let t = texto.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  return JSON.parse(t);
}

async function traducirLote(client, lote) {
  const payload = lote.map((e) => ({ id: e.id, name: e.name, instructions: e.instructions || [] }));
  const user =
    'Traducí estos ejercicios. Devolvé un JSON con esta forma exacta:\n' +
    '{ "<id>": { "nombre": "<nombre en español>", "instrucciones": ["<paso 1>", "..."] } }\n\n' +
    'Ejercicios:\n' +
    JSON.stringify(payload, null, 1);

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: 'medium' },
    system: SYSTEM,
    messages: [{ role: 'user', content: user }],
  });
  const texto = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const obj = parseJSON(texto);

  // Validación: cada id presente, con nombre y misma cantidad de pasos.
  const limpio = {};
  for (const e of lote) {
    const tr = obj[e.id];
    if (!tr || !tr.nombre || !Array.isArray(tr.instrucciones)) {
      throw new Error(`Traducción incompleta para ${e.id}`);
    }
    limpio[e.id] = { nombre: String(tr.nombre).trim(), instrucciones: tr.instrucciones.map((s) => String(s).trim()) };
  }
  return limpio;
}

async function main() {
  const limitArg = process.argv.indexOf('--limit');
  const limite = limitArg !== -1 ? parseInt(process.argv[limitArg + 1], 10) : Infinity;

  const client = new Anthropic({ maxRetries: 4 });
  const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'exercises.en.json'), 'utf8'));
  const done = cargarHechos();
  let pend = src.filter((e) => !done.has(e.id));
  if (Number.isFinite(limite)) pend = pend.slice(0, limite);

  console.log(`Modelo: ${MODEL} · ya traducidos: ${done.size} · pendientes: ${pend.length}`);
  if (pend.length === 0) {
    console.log('Nada que traducir. Corré: node scripts/build.js');
    return;
  }

  const lotes = chunk(pend, BATCH);
  let hechos = 0;
  let idx = 0;

  // Pool de concurrencia simple.
  async function worker() {
    while (true) {
      const mi = idx++;
      if (mi >= lotes.length) return;
      const lote = lotes[mi];
      try {
        const res = await traducirLote(client, lote);
        const file = path.join(DIR, `api-${String(mi).padStart(4, '0')}.json`);
        fs.writeFileSync(file, JSON.stringify(res, null, 2));
        hechos += lote.length;
        console.log(`  [${hechos}/${pend.length}] lote ${mi} OK (${lote.map((e) => e.id).join(', ').slice(0, 60)}…)`);
      } catch (err) {
        console.error(`  ! lote ${mi} falló: ${err.message} — se reintenta en la próxima corrida`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCIA }, worker));

  console.log(`\nListo. Ahora corré: node scripts/build.js`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
