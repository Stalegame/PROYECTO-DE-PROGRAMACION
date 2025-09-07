const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routers
const productsRouter = require('./routes/productsRouter');
const clientsRouter  = require('./routes/clientsRouter');
const chatbotRouter  = require('./routes/chatbotRouter');

// Monta alias en inglés y español (evita 404 por nombre distinto)
app.use('/api/products', productsRouter);
app.use('/api/productos', productsRouter);

app.use('/api/clients', clientsRouter);
app.use('/api/clientes', clientsRouter);

app.use('/api/chatbot', chatbotRouter);

// Páginas simples (opcional)
app.get('/', (req, res) => res.send('FRUNA API OK'));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '/PROYECTO-DE-PROGRAMACION/SRC/Frontend/admin_controller.html'));});
//cambiar DIRECCION DE LAS PAGINAS
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '/PROYECTO-DE-PROGRAMACION/SRC/Frontend/login_users.html'));
});
// Health
app.get('/health', (req, res) => res.json({ status: 'OK', ts: new Date().toISOString() }));
app.post('/api/login-emergencia', (req, res) => {
    console.log('🔐 Login de emergencia:', req.body);
    
    res.json({
        success: true,
        message: 'Login de emergencia exitoso',
        user: {
            id: '2',
            nombre: 'Admin Fruna',
            email: req.body.email || 'admin@fruna.com',
            role: 'admin'
        },
        token: 'emergency-token-' + Date.now(),
        redirect: '/admin'
    });
});

// Puerto
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor FRUNA corriendo en puerto ${PORT}`);
  console.log(`➡  http://localhost:${PORT}`);
});
