const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const app = express();

const PORT = process.env.PORT || 3000;

const db = new Database(
  path.join(dataDir, 'gym-tracker.db')
);

db.pragma('journal_mode = WAL');

app.use(cors());

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);

/* ================= DATABASE ================= */

db.exec(`
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY CHECK(id=1),
  name TEXT,
  weight REAL,
  height REAL,
  age INTEGER,
  sex TEXT,
  activity REAL
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER DEFAULT 3,
  reps TEXT DEFAULT '10',
  load TEXT DEFAULT '—',
  muscle TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  FOREIGN KEY(plan_id)
    REFERENCES workout_plans(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  weight REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  plan_id TEXT,
  plan_name TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  calories INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  exercise_name TEXT NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER DEFAULT 0,
  load REAL DEFAULT 0,
  completed INTEGER DEFAULT 0,
  FOREIGN KEY(session_id)
    REFERENCES workout_sessions(id)
    ON DELETE CASCADE
);
`);

/* ================= EXERCISE LIBRARY ================= */

const seed = [

  [
    'Supino reto com halteres',
    'Peito',
    'Deite-se no banco, desça os halteres com controle e empurre mantendo os pés firmes.',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Supino inclinado com halteres',
    'Peito',
    'Banco inclinado, escápulas firmes e halteres descendo de forma controlada.',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Crucifixo na polia',
    'Peito',
    'Mantenha leve flexão nos cotovelos e aproxime as mãos à frente do corpo.',
    'https://images.unsplash.com/photo-1598971639058-a4c5c9c3c8c5?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Desenvolvimento com halteres',
    'Ombros',
    'Empurre os halteres acima da cabeça sem exagerar na extensão lombar.',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Elevação lateral',
    'Ombros',
    'Eleve os braços até próximo da linha dos ombros, controlando a descida.',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Tríceps na polia',
    'Tríceps',
    'Mantenha os cotovelos próximos ao corpo e estenda os braços sem balançar.',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Rosca martelo',
    'Bíceps',
    'Pegada neutra, cotovelos estáveis e movimento controlado.',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Puxada alta',
    'Costas',
    'Puxe a barra em direção ao peito mantendo o tronco estável.',
    'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Remada na polia',
    'Costas',
    'Puxe em direção ao abdômen, juntando as escápulas sem impulsionar o corpo.',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Agachamento livre',
    'Pernas',
    'Desça com controle mantendo o tronco firme e os joelhos acompanhando os pés.',
    'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Stiff',
    'Posterior',
    'Leve o quadril para trás mantendo a coluna neutra e sinta o alongamento posterior.',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=80'
  ],

  [
    'Cadeira extensora',
    'Quadríceps',
    'Estenda os joelhos de forma controlada e pause brevemente no topo.',
    'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=900&q=80'
  ]

];

/* ================= LIBRARY SEED ================= */

db.prepare(`
  INSERT OR IGNORE INTO workout_plans(
    id,
    name,
    sort_order
  )
  VALUES(
    'LIBRARY',
    'Biblioteca',
    -1
  )
`).run();

const insertLib = db.prepare(`
  INSERT OR IGNORE INTO exercises(
    id,
    plan_id,
    name,
    sets,
    reps,
    load,
    muscle,
    instructions,
    image_url
  )
  VALUES(
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?,
    ?
  )
`);

for (
  const [
    name,
    muscle,
    instructions,
    image
  ] of seed
) {

  const id =
    'lib_' +
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '_');

  insertLib.run(
    id,
    'LIBRARY',
    name,
    3,
    '8–12',
    '—',
    muscle,
    instructions,
    image
  );
}

/* ================= HELPERS ================= */

function uid() {

  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 7)
  );

}

function getPlans() {

  const plans = db
    .prepare(
      `
      SELECT *
      FROM workout_plans
      ORDER BY sort_order, id
      `
    )
    .all();

  return plans.map(p => ({

    ...p,

    exercicios: db
      .prepare(
        `
        SELECT
          id,
          name AS nome,
          sets AS series,
          reps,
          load AS carga,
          muscle,
          instructions,
          image_url AS imageUrl
        FROM exercises
        WHERE plan_id=?
        ORDER BY rowid
        `
      )
      .all(p.id)

  }));

}

function getState() {

  const profile =
    db
      .prepare(
        `
        SELECT
          name,
          weight AS peso,
          height AS altura,
          age AS idade,
          sex,
          activity AS atividade
        FROM profile
        WHERE id=1
        `
      )
      .get() || null;

  const weightLog =
    db
      .prepare(
        `
        SELECT
          date AS data,
          weight AS peso
        FROM weight_logs
        ORDER BY date
        `
      )
      .all();

  const history =
    db
      .prepare(
        `
        SELECT
          id,
          date AS data,
          plan_name AS diaNome,
          duration,
          calories
        FROM workout_sessions
        ORDER BY date DESC, id DESC
        `
      )
      .all();

  for (const h of history) {

    h.exercicios =
      db
        .prepare(
          `
          SELECT
            exercise_name AS nome,
            set_number,
            reps,
            load AS carga,
            completed AS feito
          FROM workout_sets
          WHERE session_id=?
          ORDER BY set_number
          `
        )
        .all(h.id);

  }

  return {

    plan: getPlans(),

    weightLog,

    profile,

    userName:
      profile?.name || null,

    lastWorkoutCalories:
      history[0]?.calories || null,

    workoutHistory:
      history

  };

}

/* ================= HEALTH ================= */

app.get(
  '/api/health',
  (req, res) => {

    res.json({
      ok: true,
      db: 'sqlite'
    });

  }
);

/* ================= STATE ================= */

app.get(
  '/api/state',
  (req, res) => {

    res.json(
      getState()
    );

  }
);

/* ================= EXERCISES ================= */

app.get(
  '/api/exercises',
  (req, res) => {

    const q =
      (req.query.q || '')
        .trim();

    let rows;

    if (q) {

      rows =
        db
          .prepare(
            `
            SELECT
              id,
              name,
              muscle,
              instructions,
              image_url AS imageUrl
            FROM exercises
            WHERE
              plan_id='LIBRARY'
              AND name LIKE ?
            ORDER BY name
            LIMIT 20
            `
          )
          .all(
            `%${q}%`
          );

    } else {

      rows =
        db
          .prepare(
            `
            SELECT
              id,
              name,
              muscle,
              instructions,
              image_url AS imageUrl
            FROM exercises
            WHERE plan_id='LIBRARY'
            ORDER BY name
            LIMIT 50
            `
          )
          .all();

    }

    res.json(rows);

  }
);

/* ================= PROFILE ================= */

app.put(
  '/api/profile',
  (req, res) => {

    const p =
      req.body || {};

    db
      .prepare(
        `
        INSERT INTO profile(
          id,
          name,
          weight,
          height,
          age,
          sex,
          activity
        )
        VALUES(
          1,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )

        ON CONFLICT(id)
        DO UPDATE SET

          name=excluded.name,

          weight=excluded.weight,

          height=excluded.height,

          age=excluded.age,

          sex=excluded.sex,

          activity=excluded.activity
        `
      )
      .run(
        p.name || '',
        p.peso || null,
        p.altura || null,
        p.idade || null,
        p.sexo || 'M',
        p.atividade || 1.55
      );

    res.json(
      getState()
    );

  }
);

app.put(
  '/api/name',
  (req, res) => {

    const name =
      String(
        req.body?.name || ''
      ).trim();

    db
      .prepare(
        `
        INSERT INTO profile(
          id,
          name
        )
        VALUES(
          1,
          ?
        )

        ON CONFLICT(id)
        DO UPDATE SET
          name=excluded.name
        `
      )
      .run(name);

    res.json({
      ok: true
    });

  }
);

/* ================= PLANS ================= */

app.post(
  '/api/plans',
  (req, res) => {

    const {
      name
    } = req.body || {};

    if (!name?.trim()) {

      return res
        .status(400)
        .json({
          error: 'Nome obrigatório'
        });

    }

    const id = uid();

    db
      .prepare(
        `
        INSERT INTO workout_plans(
          id,
          name,
          sort_order
        )
        VALUES(
          ?,
          ?,
          ?
        )
        `
      )
      .run(
        id,
        name.trim(),
        Date.now()
      );

    res.json(
      getState()
    );

  }
);

app.delete(
  '/api/plans/:id',
  (req, res) => {

    db
      .prepare(
        'DELETE FROM exercises WHERE plan_id=?'
      )
      .run(req.params.id);

    db
      .prepare(
        'DELETE FROM workout_plans WHERE id=?'
      )
      .run(req.params.id);

    res.json(
      getState()
    );

  }
);

/* ================= ADD EXERCISE ================= */

app.post(
  '/api/plans/:id/exercises',
  (req, res) => {

    const e =
      req.body || {};

    if (!e.name?.trim()) {

      return res
        .status(400)
        .json({
          error: 'Exercício obrigatório'
        });

    }

    const lib =
      db
        .prepare(
          `
          SELECT
            muscle,
            instructions,
            image_url
          FROM exercises
          WHERE
            plan_id='LIBRARY'
            AND lower(name)=lower(?)
          LIMIT 1
          `
        )
        .get(
          e.name.trim()
        );

    db
      .prepare(
        `
        INSERT INTO exercises(
          id,
          plan_id,
          name,
          sets,
          reps,
          load,
          muscle,
          instructions,
          image_url
        )
        VALUES(
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )
        `
      )
      .run(
        uid(),
        req.params.id,
        e.name.trim(),
        Number(e.series) || 3,
        e.reps || '10',
        e.carga || '—',
        lib?.muscle || '',
        lib?.instructions || '',
        lib?.image_url || ''
      );

    res.json(
      getState()
    );

  }
);

/* ================= DELETE EXERCISE ================= */

app.delete(
  '/api/exercises/:id',
  (req, res) => {

    db
      .prepare(
        'DELETE FROM exercises WHERE id=?'
      )
      .run(req.params.id);

    res.json(
      getState()
    );

  }
);

/* ================= EDIT EXERCISE ================= */

app.put(
  '/api/exercises/:id',
  (req, res) => {

    const e =
      req.body || {};

    db
      .prepare(
        `
        UPDATE exercises
        SET
          name=?,
          sets=?,
          reps=?,
          load=?
        WHERE id=?
        `
      )
      .run(
        e.name,
        Number(e.series) || 3,
        e.reps || '10',
        e.carga || '—',
        req.params.id
      );

    res.json(
      getState()
    );

  }
);

/* ================= WEIGHTS ================= */

app.post(
  '/api/weights',
  (req, res) => {

    const {
      data,
      peso
    } = req.body || {};

    if (!data || !peso) {

      return res
        .status(400)
        .json({
          error:
            'Data e peso obrigatórios'
        });

    }

    db
      .prepare(
        `
        INSERT INTO weight_logs(
          date,
          weight
        )
        VALUES(
          ?,
          ?
        )
        `
      )
      .run(
        data,
        Number(peso)
      );

    res.json(
      getState()
    );

  }
);

app.delete(
  '/api/weights/:id',
  (req, res) => {

    db
      .prepare(
        'DELETE FROM weight_logs WHERE id=?'
      )
      .run(req.params.id);

    res.json(
      getState()
    );

  }
);

/* ================= SAVE WORKOUT ================= */

app.post(
  '/api/workouts',
  (req, res) => {

    try {

      const w =
        req.body || {};

      const insert =
        db.prepare(
          `
          INSERT INTO workout_sessions(
            date,
            plan_id,
            plan_name,
            duration,
            calories
          )
          VALUES(
            ?,
            ?,
            ?,
            ?,
            ?
          )
          `
        );

      const info =
        insert.run(
          w.data ||
            new Date()
              .toISOString()
              .slice(0, 10),

          w.planId || null,

          w.diaNome ||
            'Treino',

          Number(w.duration) || 0,

          Number(w.calories) || 0
        );

      const sessionId =
        info.lastInsertRowid;

      const insertSet =
        db.prepare(
          `
          INSERT INTO workout_sets(
            session_id,
            exercise_name,
            set_number,
            reps,
            load,
            completed
          )
          VALUES(
            ?,
            ?,
            ?,
            ?,
            ?,
            ?
          )
          `
        );

      for (
        const ex of
        (w.exercicios || [])
      ) {

        for (
          const s of
          (ex.sets || [])
        ) {

          insertSet.run(

            sessionId,

            ex.nome,

            Number(
              s.setNumber
            ) || 0,

            Number(
              s.reps
            ) || 0,

            Number(
              s.carga
            ) || 0,

            s.feito
              ? 1
              : 0

          );

        }

      }

      res
        .status(201)
        .json(
          getState()
        );

    } catch (error) {

      console.error(
        'Erro ao salvar treino:',
        error
      );

      res
        .status(500)
        .json({
          error:
            'Erro ao salvar o treino.'
        });

    }

  }
);

/* ================= EXERCISE HISTORY ================= */

app.get(
  '/api/workouts/:exercise',
  (req, res) => {

    const name =
      decodeURIComponent(
        req.params.exercise
      );

    const rows =
      db
        .prepare(
          `
          SELECT
            ws.date,
            ws.plan_name AS diaNome,
            wset.set_number,
            wset.reps,
            wset.load AS carga
          FROM workout_sets wset

          JOIN workout_sessions ws
            ON ws.id=wset.session_id

          WHERE
            lower(wset.exercise_name)
            =
            lower(?)

            AND wset.completed=1

          ORDER BY
            ws.date DESC,
            wset.set_number
          `
        )
        .all(name);

    res.json(rows);

  }
);

/* ================= FRONTEND ================= */

app.use(
  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        'public',
        'index.html'
      )
    );

  }
);

/* ================= START SERVER ================= */

app.listen(
  PORT,
  () => {

    console.log(
      `GYM TRACKER rodando em http://localhost:${PORT}`
    );

  }
);