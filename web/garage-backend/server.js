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
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// CORS : web-client + Expo / React Native (origine absente ou LAN)
app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        const allowed = [
            'http://localhost:3001',
            'http://127.0.0.1:3001',
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/,
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
            /^exp:\/\//,
        ];
        if (allowed.some((rule) => (typeof rule === 'string' ? origin === rule : rule.test(origin)))) {
            return callback(null, true);
        }
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
const utilisateurRoutes = require('./src/routes/utilisateurs');
const suiviRoutes = require('./src/routes/suivi');
const configurationRoutes = require('./src/routes/configurations');
// const paiementRoutes = require('./src/routes/paiement');
const depannageRoutes = require('./src/routes/depannage');

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
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/suivi', suiviRoutes);
app.use('/api/configurations', configurationRoutes);
// app.use('/api/paiement', paiementRoutes);
app.use('/api/depannage', depannageRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Serveur démarré' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = { app, io };