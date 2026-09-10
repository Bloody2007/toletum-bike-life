const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos en archivo local (JSON)
const DATA_FILE = path.join(__dirname, 'data.json');

const getInitialData = () => ({
  storeTitle: "TOLETUM BIKE LIFE",
  subtitle: "Streetwear & Urban Culture | Toledo",
  tiktokEmbeds: [
    "https://www.tiktok.com/embed/7200000000000000000"
  ],
  products: [
    { id: 1, name: "Sudadera Hoodie Oversized", price: "45.00€", tag: "NUEVO" },
    { id: 2, name: "Camiseta Graphic Street", price: "25.00€", tag: "TOP" }
  ],
  orders: []
});

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(getInitialData(), null, 2));
}

const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// API Endpoints
app.get('/api/content', (req, res) => {
  res.json(readData());
});

app.post('/api/content', (req, res) => {
  const { password, storeTitle, subtitle, tiktokEmbeds } = req.body;
  if (password !== 'admin123') {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  const currentData = readData();
  currentData.storeTitle = storeTitle || currentData.storeTitle;
  currentData.subtitle = subtitle || currentData.subtitle;
  if (tiktokEmbeds) currentData.tiktokEmbeds = tiktokEmbeds;
  writeData(currentData);
  res.json({ success: true, message: 'Contenido actualizado correctamente' });
});

app.post('/api/orders', (req, res) => {
  const data = readData();
  const newOrder = { id: Date.now(), ...req.body, status: 'Pendiente', date: new Date().toLocaleDateString() };
  data.orders.unshift(newOrder);
  writeData(data);
  res.json({ success: true, orderId: newOrder.id });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});