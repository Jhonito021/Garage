const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Socket.IO
io.on('connection', (socket) => {
    console.log('Client connecté');
    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});

// Routes
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Serveur démarré' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = { app, io };