const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    }
}));

// CORS - Accepter les requêtes du mobile
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Middleware pour logger
app.use((req, res, next) => {
    console.log('=== REQUÊTE MOBILE ===');
    console.log('URL:', req.method, req.url);
    console.log('Session ID:', req.sessionID);
    console.log('Session userId:', req.session.userId);
    next();
});

// Routes
const authRoutes = require('./src/routes/auth');
const vehiculeRoutes = require('./src/routes/vehicules');
const rdvRoutes = require('./src/routes/rdv');
const factureRoutes = require('./src/routes/factures');
const suiviRoutes = require('./src/routes/suivi');
const depannageRoutes = require('./src/routes/depannage');
const interventionRoutes = require('./src/routes/interventions');

app.use('/api/auth', authRoutes);
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/rdv', rdvRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/suivi', suiviRoutes);
app.use('/api/depannage', depannageRoutes);
app.use('/api/interventions', interventionRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Serveur mobile démarré' });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Backend mobile démarré sur http://localhost:${PORT}`);
});

module.exports = app;