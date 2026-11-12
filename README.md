TwentyOne Garage

Application Web et Mobile de Gestion de Garage Automobile

TwentyOne Garage est une solution numérique destinée à faciliter la gestion quotidienne d'un garage automobile. Elle permet de centraliser les opérations administratives, techniques et commerciales au sein d'une plateforme accessible depuis un navigateur web ou un appareil mobile.

Présentation du projet

L'application permet aux différents utilisateurs du garage de gérer les clients, les véhicules, les rendez-vous, les interventions mécaniques, les pièces détachées et les opérations de facturation.

Le projet comprend deux interfaces complémentaires :

- Une application web destinée à la gestion et à l'administration du garage.
- Une application mobile permettant d'accéder aux fonctionnalités depuis un smartphone.

Fonctionnalités principales

Gestion des utilisateurs

- Authentification et gestion des comptes.
- Gestion des rôles et des permissions.
- Gestion des administrateurs, clients, techniciens et caissiers.

Gestion des clients et véhicules

- Enregistrement et modification des clients.
- Gestion des informations des véhicules.
- Suivi des immatriculations et des kilométrages.
- Consultation de l'historique des véhicules.

Gestion des rendez-vous

- Création et gestion des rendez-vous.
- Association des rendez-vous aux clients et aux véhicules.
- Suivi des statuts des rendez-vous.

Gestion des interventions

- Planification des interventions.
- Affectation des techniciens.
- Suivi de l'avancement des réparations.
- Gestion des opérations de maintenance.
- Historique des interventions.

Gestion des vidanges

- Enregistrement des vidanges.
- Suivi du kilométrage.
- Gestion des types d'huile.
- Historique des entretiens.

Gestion commerciale

- Création et gestion des devis.
- Génération des factures.
- Suivi des paiements.
- Génération de documents PDF.

Gestion du stock

- Gestion des pièces détachées.
- Suivi des quantités disponibles.
- Définition des seuils d'alerte.
- Association des pièces aux interventions.

Notifications et services complémentaires

- Notifications destinées aux clients.
- Rappels d'entretien et de vidange.
- Communication en temps réel.
- Intégration de services de paiement en ligne.

Technologies utilisées

Application Web

Technologie| Utilisation
React.js| Interface utilisateur
JavaScript| Logique applicative
CSS3| Mise en forme
React Router| Navigation
Axios| Communication avec l'API
Recharts| Visualisation des données
Leaflet| Cartographie
Stripe| Paiement en ligne

Backend Web

Technologie| Utilisation
Node.js| Environnement serveur
Express.js| API REST
MySQL| Gestion des données
MySQL2| Connexion à la base de données
Socket.IO| Communication en temps réel
Bcrypt| Hachage des mots de passe
Multer| Gestion des fichiers
PDFKit| Génération des documents PDF

Application Mobile

Technologie| Utilisation
React Native| Développement mobile
Expo| Environnement de développement
JavaScript / TypeScript| Développement applicatif
React Navigation| Navigation mobile
AsyncStorage| Stockage local
Expo Location| Géolocalisation
React Native Maps| Cartographie

Backend Mobile

- Node.js
- Express.js
- MySQL
- Bcrypt
- Multer
- PDFKit

Base de données

- MySQL
- SQL

Architecture du projet

Le dépôt est organisé en plusieurs parties indépendantes :

Garage/
│
├── db/
│   ├── garage_db.sql
│   └── schema.sql
│
├── web/
│   ├── garage-frontend/
│   │   ├── public/
│   │   ├── src/
│   │   └── package.json
│   │
│   └── garage-backend/
│       ├── src/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── models/
│       │   ├── routes/
│       │   └── utils/
│       ├── server.js
│       └── package.json
│
├── mobile/
│   ├── frontend-mobile/
│   │   ├── src/
│   │   ├── assets/
│   │   ├── app.json
│   │   └── package.json
│   │
│   └── backend-mobile/
│       ├── src/
│       ├── server.js
│       └── package.json
│
└── README.md

Installation et configuration

1. Cloner le dépôt

git clone https://github.com/Jhonito021/Garage.git

cd Garage

2. Configurer la base de données

Créer une base de données MySQL et importer le fichier SQL :

mysql -u root -p < db/schema.sql

Le dépôt contient également le fichier "db/garage_db.sql", qui peut être consulté pour examiner le schéma et les données de la base.

3. Installer le backend web

cd web/garage-backend
npm install

Configurer les variables d'environnement dans un fichier ".env" en fonction des paramètres de connexion MySQL, du port serveur et des services utilisés.

Démarrer le serveur :

npm run dev

4. Installer le frontend web

Dans un autre terminal :

cd web/garage-frontend
npm install
npm start

5. Installer le backend mobile

cd mobile/backend-mobile
npm install
npm run dev

Configurer également son fichier ".env" avec les paramètres nécessaires.

6. Installer l'application mobile

cd mobile/frontend-mobile
npm install

Démarrer Expo :

npm start

Pour Android :

npm run android

Configuration importante

Avant de lancer les applications, vérifier les éléments suivants :

- Les paramètres de connexion à MySQL.
- Les ports utilisés par les serveurs.
- Les URL des API configurées dans les applications frontend.
- La configuration CORS.
- Les clés nécessaires aux services externes, notamment Stripe.
- La configuration réseau pour connecter l'application mobile au backend.

Ne jamais publier les mots de passe, les clés API ou les informations confidentielles dans le dépôt GitHub.

Déploiement

L'application web est accessible à l'adresse suivante :

https://garage-gamma-nine.vercel.app/

Le déploiement du frontend et celui des backends doivent être configurés séparément.

Objectifs du projet

- Digitaliser la gestion d'un garage automobile.
- Simplifier le suivi des véhicules et des interventions.
- Améliorer la communication entre les clients et les techniciens.
- Faciliter la gestion administrative et financière.
- Centraliser les informations dans une base de données.
- Proposer une solution accessible sur ordinateur et smartphone.

Auteur

Solonotiavina Jhonito RABENIRINA

Étudiant en Licence 3 Informatique – Génie Logiciel

- GitHub : https://github.com/Jhonito021
- Portfolio : https://portfolio-jhonito.vercel.app/
- Email : jhonito021@gmail.com

Licence

Projet académique et personnel.

© 2026 – TwentyOne Garage
