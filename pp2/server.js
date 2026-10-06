const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const { engine } = require("express-handlebars");

const app = express();

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

app.use(express.json());
app.use(express.static(__dirname + "/public"));

const db = new sqlite3.Database("escola.db");

db.serialize(() => {
  // Tabela de usuários
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL
    )
  `);

  // Tabela de alunos
  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      matricula TEXT UNIQUE NOT NULL,
      turma TEXT NOT NULL
    )
  `);

  // Usuário administrador
  db.run(`
    INSERT OR IGNORE INTO usuarios
    (nome, email, senha, tipo)
    VALUES
    ('Administrador', 'admin@escola.com', '123', 'admin')
  `);

  // Usuário professor
  db.run(`
    INSERT OR IGNORE INTO usuarios
    (nome, email, senha, tipo)
    VALUES
    ('Professor', 'professor@escola.com', '123', 'professor')
  `);

  // Usuário aluno
  db.run(`
  INSERT OR IGNORE INTO usuarios
  (nome, email, senha, tipo)
  VALUES
  ('Aluno', 'aluno@escola.com', '123', 'aluno')
`);

  //  Tabela do Professor
  db.run(`
    CREATE TABLE IF NOT EXISTS professores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        disciplina TEXT NOT NULL
    )
`);
});

// Tabela de Frequência
db.run(`
    CREATE TABLE IF NOT EXISTS frequencia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_id INTEGER NOT NULL,
        data TEXT NOT NULL,
        presente INTEGER NOT NULL
    )
`);

db.run(`
CREATE TABLE IF NOT EXISTS notas(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER,
    disciplina TEXT,
    nota REAL
)
`);

// PÁGINAS
app.get("/", (req, res) => {
  res.render("index", {
    titulo: "Login",
    css: "styles.css",
    js: "script.js",
  });
});

app.get("/admin", (req, res) => {
  res.render("admin", {
    titulo: "Painel do Administrador",
    css: "admin.css",
  });
});

app.get("/professor", (req, res) => {
  res.render("professor", {
    titulo: "Painel do Professor",
    css: "professor.css",
  });
});

app.get("/aluno", (req, res) => {
  res.render("aluno", {
    titulo: "Painel do Aluno",
    css: "aluno.css",
  });
});

app.get("/cadastro-alunos", (req, res) => {
  res.render("cadastro-alunos", {
    titulo: "Cadastro de Alunos",
    css: "cadastro-alunos.css",
    js: "cadastro-alunos.js",
  });
});

app.get("/cadastro-professores", (req, res) => {
  res.render("cadastro-professores", {
    titulo: "Cadastro de Professores",
    css: "cadastro-professores.css",
    js: "cadastro-professores.js",
  });
});

app.get("/alunos", (req, res) => {
  res.render("alunos", {
    titulo: "Alunos Cadastrados",
    css: "alunos.css",
    js: "alunos.js",
  });
});

app.get("/frequencia", (req, res) => {
  res.render("frequencia", {
    titulo: "Registro de Frequência",
    css: "frequencia.css",
    js: "frequencia.js",
  });
});

app.get("/notas", (req, res) => {
  res.render("notas", {
    titulo: "Lançar Notas",
    css: "notas.css",
    js: "notas.js",
  });
});

app.get("/minha-frequencia", (req, res) => {
  res.render("minha-frequencia", {
    titulo: "Frequência",
    css: "minha-frequencia.css",
    js: "minha-frequencia.js",
  });
});

app.get("/minhas-notas", (req, res) => {
  res.render("minhas-notas", {
    titulo: "Minhas Notas",
    css: "minhas-notas.css",
    js: "minhas-notas.js",
  });
});

app.get("/perfil", (req, res) => {
  res.render("perfil", {
    titulo: "Meu Perfil",
    css: "perfil.css",
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
    [email, senha],
    (err, usuario) => {
      if (err) {
        return res.status(500).json({ sucesso: false });
      }

      if (!usuario) {
        return res.json({ sucesso: false });
      }

      res.json({
        sucesso: true,
        tipo: usuario.tipo,
      });
    },
  );
});

// CADASTRAR ALUNO
app.post("/api/alunos", (req, res) => {
  const { nome, matricula, turma } = req.body;

  db.run(
    "INSERT INTO alunos(nome, matricula, turma) VALUES (?, ?, ?)",
    [nome, matricula, turma],
    function (err) {
      if (err) {
        return res.json({ sucesso: false });
      }

      res.json({ sucesso: true });
    },
  );
});

// LISTAR ALUNOS
app.get("/api/alunos", (req, res) => {
  db.all("SELECT * FROM alunos", [], (err, alunos) => {
    if (err) {
      return res.status(500).json([]);
    }

    res.json(alunos);
  });
});

// EDITAR ALUNO
app.put("/api/alunos/:id", (req, res) => {
  const id = req.params.id;
  const { nome, matricula, turma } = req.body;

  db.run(
    "UPDATE alunos SET nome = ?, matricula = ?, turma = ? WHERE id = ?",
    [nome, matricula, turma, id],
    function (err) {
      if (err) {
        return res.json({ sucesso: false });
      }

      res.json({ sucesso: true });
    },
  );
});

// EXCLUIR ALUNO
app.delete("/api/alunos/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM alunos WHERE id = ?", [id], function (err) {
    if (err) {
      return res.json({ sucesso: false });
    }

    res.json({ sucesso: true });
  });
});

// Cadastrar prodessores
app.post("/api/professores", (req, res) => {
  const { nome, cpf, disciplina } = req.body;

  db.run(
    "INSERT INTO professores (nome, cpf, disciplina) VALUES (?, ?, ?)",
    [nome, cpf, disciplina],
    function (err) {
      if (err) {
        return res.json({ sucesso: false });
      }

      res.json({ sucesso: true });
    },
  );
});

// LISTAR PROFESSORES
app.get("/api/professores", (req, res) => {
  db.all("SELECT * FROM professores", [], (err, professores) => {
    if (err) {
      return res.json([]);
    }

    res.json(professores);
  });
});

// EDITAR  PROFESSORES
app.put("/api/professores/:id", (req, res) => {
  const id = req.params.id;
  const { nome, cpf, disciplina } = req.body;

  db.run(
    "UPDATE professores SET nome = ?, cpf = ?, disciplina = ? WHERE id = ?",
    [nome, cpf, disciplina, id],
    function (err) {
      if (err) {
        return res.json({ sucesso: false });
      }

      res.json({ sucesso: true });
    },
  );
});

// EXCLUIR PROFESSOR
app.delete("/api/professores/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM professores WHERE id = ?", [id], function (err) {
    if (err) {
      return res.json({ sucesso: false });
    }

    res.json({ sucesso: true });
  });
});

// LISTAR ALUNOS PARA FREQUÊNCIA
app.get("/api/frequencia/alunos", (req, res) => {
  db.all("SELECT * FROM alunos", [], (err, alunos) => {
    if (err) {
      return res.status(500).json([]);
    }

    res.json(alunos);
  });
});

// SALVAR FREQUÊNCIA
app.post("/api/frequencia", (req, res) => {
  const { aluno_id, data, presente } = req.body;

  db.run(
    "INSERT INTO frequencia (aluno_id, data, presente) VALUES (?, ?, ?)",

    [aluno_id, data, presente],
    function (err) {
      if (err) {
        return res.json({ sucesso: false });
      }

      res.json({ sucesso: true });
    },
  );
});

app.get("/api/frequencia", (req, res) => {
  db.all(
    `SELECT
            alunos.nome,
            alunos.matricula,
            alunos.turma,
            frequencia.data,
            frequencia.presente

        FROM frequencia

        INNER JOIN alunos
        ON alunos.id = frequencia.aluno_id`,

    [],

    (err, resultado) => {
      if (err) {
        return res.json([]);
      }

      res.json(resultado);
    },
  );
});

app.post("/api/notas", (req, res) => {
  const { aluno_id, disciplina, nota } = req.body;

  db.run(
    "INSERT INTO notas(aluno_id, disciplina, nota) VALUES(?,?,?)",
    [aluno_id, disciplina, nota],
    function (err) {
      if (err) {
        return res.json({ sucesso: false });
      }

      res.json({ sucesso: true });
    },
  );
});

app.get("/api/notas", (req, res) => {
  db.all(
    `
        SELECT
            alunos.nome,
            alunos.matricula,
            notas.disciplina,
            notas.nota

        FROM notas

        INNER JOIN alunos
        ON alunos.id = notas.aluno_id

    `,
    [],
    (err, dados) => {
      if (err) {
        return res.json([]);
      }

      res.json(dados);
    },
  );
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
