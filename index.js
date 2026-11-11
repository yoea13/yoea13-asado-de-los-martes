const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'yoea13-asado-de-los-martes' });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🔥 Asado de los Martes corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
