const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3001',
        credentials: true,
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

// Session middleware
app.use(session({
    secret: 'mon_secret_pour_les_sessions_2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// CORS doit être AVANT les routes
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Middleware pour logger la session (debug)
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session userId:', req.session.userId);
    next();
});

io.on('connection', (socket) => {
    console.log('Client connecté');
    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});

const authRoutes = require('./src/routes/auth');
const vehiculeRoutes = require('./src/routes/vehicules');
const rdvRoutes = require('./src/routes/rdv');
const interventionRoutes = require('./src/routes/interventions');
const vidangeRoutes = require('./src/routes/vidange');
const factureRoutes = require('./src/routes/factures');
const devisRoutes = require('./src/routes/devis');
const pieceRoutes = require('./src/routes/pieces');
const photoRoutes = require('./src/routes/photos');
const planningRoutes = require('./src/routes/planning');
const notificationRoutes = require('./src/routes/notifications');
const statistiqueRoutes = require('./src/routes/statistiques');
const clientRoutes = require('./src/routes/clients');

app.use('/api/auth', authRoutes);
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/rdv', rdvRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/vidange', vidangeRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/pieces', pieceRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/statistiques', statistiqueRoutes);
app.use('/api/clients', clientRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Serveur démarré' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = { app, io };