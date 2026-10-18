const express = require('express');
const admin = require('firebase-admin');

// Lee la credencial desde una variable de entorno en lugar de un archivo
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// LISTAR alumnos (Read)
app.get('/', async (req, res) => {
  const snapshot = await db.collection('alumnos').get();
  const alumnos = [];
  snapshot.forEach(doc => alumnos.push({ id: doc.id, ...doc.data() }));
  res.render('index', { alumnos });
});

// CREAR alumno (Create)
app.post('/crear', async (req, res) => {
  const { id, nombre, apellidos, edad, grado } = req.body;

  // Verificar si la matrícula ya existe
  const existente = await db.collection('alumnos').doc(id).get();

  if (existente.exists) {
    return res.send(`
      <script>
        alert('La matrícula ${id} ya existe. Usa otra.');
        window.location.href = '/';
      </script>
    `);
  }

  await db.collection('alumnos').doc(id).set({ id, nombre, apellidos, edad, grado });
  res.redirect('/');
});

// FORMULARIO de edición
app.get('/editar/:id', async (req, res) => {
  const doc = await db.collection('alumnos').doc(req.params.id).get();
  res.render('editar', { alumno: { id: doc.id, ...doc.data() } });
});

// ACTUALIZAR alumno (Update)
app.post('/actualizar/:id', async (req, res) => {
  const { id, nombre, apellidos, edad, grado } = req.body;
  await db.collection('alumnos').doc(req.params.id).set({ id, nombre, apellidos, edad, grado });
  res.redirect('/');
});

// ELIMINAR alumno (Delete)
app.post('/eliminar/:id', async (req, res) => {
  await db.collection('alumnos').doc(req.params.id).delete();
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor en http://localhost:' + PORT));

