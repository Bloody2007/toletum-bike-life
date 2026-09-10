const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Sirve todos los archivos de la carpeta public (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data.json');

const getInitialData = () => ({
  config: {
    storeTitle: "TOLETUM BIKELIFE",
    subtitle: "Streetwear & Urban Culture | Toledo",
    bgColor: "#090a0f",
    panelColor: "#12141d",
    accentBlue: "#00d2ff",
    accentPink: "#ff0055",
    textColor: "#ffffff",
    logoUrl: "/logo-toletum.jpeg"
  },
  tiktokEmbeds: [
    "https://www.tiktok.com/embed/7200000000000000000"
  ],
  products: [
    { id: 1, name: "Sudadera Hoodie Oversized", price: "45.00", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500", tag: "NUEVO" },
    { id: 2, name: "Camiseta Graphic Street", price: "25.00", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500", tag: "TOP" }
  ],
  orders: [
    {
      id: 1001,
      customerName: "Juan Pérez",
      email: "juan@example.com",
      phone: "+34 600 000 000",
      address: "Calle Comercio 12, Toledo",
      deliveryType: "Envío a Domicilio",
      items: "Sudadera Hoodie Oversized (x1)",
      total: "45.00€",
      status: "Pendiente",
      date: "10/09/2026"
    }
  ]
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

app.post('/api/config', (req, res) => {
  const { password, config, tiktokEmbeds } = req.body;
  if (password !== 'admin123') {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }
  const data = readData();
  if (config) data.config = { ...data.config, ...config };
  if (tiktokEmbeds) data.tiktokEmbeds = tiktokEmbeds;
  writeData(data);
  res.json({ success: true, message: 'Configuración actualizada correctamente' });
});

app.post('/api/products', (req, res) => {
  const { password, product } = req.body;
  if (password !== 'admin123') return res.status(401).json({ error: 'Contraseña incorrecta' });
  
  const data = readData();
  const newProd = { id: Date.now(), ...product };
  data.products.push(newProd);
  writeData(data);
  res.json({ success: true, message: 'Producto añadido al catálogo' });
});

app.delete('/api/products/:id', (req, res) => {
  const { password } = req.body;
  if (password !== 'admin123') return res.status(401).json({ error: 'Contraseña incorrecta' });

  const data = readData();
  data.products = data.products.filter(p => p.id !== parseInt(req.params.id));
  writeData(data);
  res.json({ success: true, message: 'Producto eliminado' });
});

app.post('/api/orders', (req, res) => {
  const data = readData();
  const newOrder = {
    id: Date.now(),
    ...req.body,
    status: 'Pendiente',
    date: new Date().toLocaleDateString('es-ES')
  };
  data.orders.unshift(newOrder);
  writeData(data);
  res.json({ success: true, orderId: newOrder.id });
});

// Rutas explícitas para el Panel Admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Ruta por defecto para la tienda
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor de Toletum Bikelife ejecutándose en el puerto ${PORT}`);
});