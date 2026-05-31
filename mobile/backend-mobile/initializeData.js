const bcrypt = require('bcrypt');
const db = require('./src/models/db');

const initializeTestData = async () => {
    try {
        console.log('Initialisation des données de test...');

        // Créer les utilisateurs de test
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = [
            {
                email: 'client@test.com',
                mot_de_passe: hashedPassword,
                nom: 'Dupont',
                prenom: 'Marie',
                telephone: '0612345678',
                adresse: '123 Rue de la Paix',
                role: 'client'
            },
            {
                email: 'depanneur@test.com',
                mot_de_passe: hashedPassword,
                nom: 'Durand',
                prenom: 'Jean',
                telephone: '0687654321',
                adresse: '456 Avenue des Champs',
                role: 'depanneur'
            },
            {
                email: 'technicien@test.com',
                mot_de_passe: hashedPassword,
                nom: 'Martin',
                prenom: 'Pierre',
                telephone: '0698765432',
                adresse: '789 Boulevard Central',
                role: 'technicien'
            }
        ];

        // Supprimer les utilisateurs existants pour éviter les doublons
        await db.query('DELETE FROM utilisateurs WHERE email IN (?, ?, ?)', 
            [users[0].email, users[1].email, users[2].email]);

        // Insérer les nouveaux utilisateurs
        for (const user of users) {
            await db.query(
                `INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, telephone, adresse, role)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user.email, user.mot_de_passe, user.nom, user.prenom, user.telephone, user.adresse, user.role]
            );
            console.log(`✓ Utilisateur créé: ${user.email} (${user.role})`);
        }

        console.log('\n✓ Données de test initialisées!');
        console.log('\nComptes de test disponibles:');
        console.log('  Client: client@test.com / password123');
        console.log('  Dépanneur: depanneur@test.com / password123');
        console.log('  Technicien: technicien@test.com / password123');

        process.exit(0);
    } catch (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }
};

initializeTestData();
