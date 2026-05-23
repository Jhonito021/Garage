-- Création de la base de données
CREATE DATABASE IF NOT EXISTS garage_db;
USE garage_db;

-- Table utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    adresse TEXT,
    role ENUM('client', 'technicien', 'admin', 'caissier') DEFAULT 'client',
    notifications_acceptees BOOLEAN DEFAULT TRUE,
    specialite VARCHAR(100) NULL,
    actif BOOLEAN DEFAULT TRUE,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table vehicules
CREATE TABLE IF NOT EXISTS vehicules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    immatriculation VARCHAR(20) NOT NULL UNIQUE,
    marque VARCHAR(50) NOT NULL,
    modele VARCHAR(50) NOT NULL,
    annee INT,
    type_carburant VARCHAR(30),
    kilometrage_actuel INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Table rdv
CREATE TABLE IF NOT EXISTS rdv (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    vehicule_id INT NOT NULL,
    date_heure DATETIME NOT NULL,
    service_demande VARCHAR(100) NOT NULL,
    statut ENUM('confirmé', 'annulé', 'terminé') DEFAULT 'confirmé',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE
);

-- Table interventions
CREATE TABLE IF NOT EXISTS interventions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicule_id INT NOT NULL,
    technicien_id INT NOT NULL,
    rdv_id INT NULL,
    date_debut DATETIME,
    date_fin DATETIME,
    statut ENUM('prévue', 'en_cours', 'terminée') DEFAULT 'prévue',
    description TEXT,
    duree_totale INT NULL COMMENT 'durée en minutes',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (technicien_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (rdv_id) REFERENCES rdv(id) ON DELETE SET NULL
);

-- Table vidanges
CREATE TABLE IF NOT EXISTS vidanges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicule_id INT NOT NULL,
    intervention_id INT NOT NULL,
    date_vidange DATE NOT NULL,
    kilometrage INT NOT NULL,
    type_huile ENUM('synthétique', 'semi_synthétique', 'minérale') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE CASCADE,
    FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE CASCADE
);

-- Table factures
CREATE TABLE IF NOT EXISTS factures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intervention_id INT NOT NULL,
    date_emission DATE NOT NULL,
    montant_total DECIMAL(10,2) NOT NULL,
    statut_paiement ENUM('payé', 'impayé', 'acompte') DEFAULT 'impayé',
    pdf_url VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE CASCADE
);

-- Table devis
CREATE TABLE IF NOT EXISTS devis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intervention_id INT NOT NULL,
    date_emission DATE NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    statut ENUM('envoyé', 'accepté', 'refusé') DEFAULT 'envoyé',
    pdf_url VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE CASCADE
);

-- Table pieces
CREATE TABLE IF NOT EXISTS pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    reference VARCHAR(50) NOT NULL UNIQUE,
    quantite_stock INT NOT NULL DEFAULT 0,
    seuil_alerte INT NOT NULL DEFAULT 5,
    prix_unitaire DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table intervention_pieces
CREATE TABLE IF NOT EXISTS intervention_pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intervention_id INT NOT NULL,
    piece_id INT NOT NULL,
    quantite_utilisee INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE CASCADE,
    FOREIGN KEY (piece_id) REFERENCES pieces(id) ON DELETE CASCADE
);

-- Table photos
CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    intervention_id INT NOT NULL,
    url_photo VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE CASCADE
);

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    vehicule_id INT NULL,
    message TEXT NOT NULL,
    type ENUM('vidange', 'ct', 'rappel') NOT NULL,
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('envoyé', 'lu') DEFAULT 'envoyé',
    FOREIGN KEY (client_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicule_id) REFERENCES vehicules(id) ON DELETE SET NULL
);

-- Table configurations
CREATE TABLE IF NOT EXISTS configurations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cle VARCHAR(100) NOT NULL UNIQUE,
    valeur TEXT NOT NULL,
    description VARCHAR(255) NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertion des configurations par défaut
INSERT INTO configurations (cle, valeur, description) VALUES
('intervalle_vidange_defaut', '8000', 'Intervalle par défaut pour vidange (km)'),
('intervalle_ct_defaut', '2', 'Intervalle contrôle technique (années)'),
('heure_ouverture', '08:00', 'Heure d ouverture du garage'),
('heure_fermeture', '18:00', 'Heure de fermeture du garage'),
('seuil_relance_vidange', '2000', 'Déclencher alerte X km avant échéance');

-- Insertion d'un compte admin par défaut (mot de passe: admin123)
-- Le mot de passe est haché avec bcrypt
INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role, actif) VALUES
('admin@garage.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'Garage', 'admin', TRUE);

-- Insertion d'un compte technicien par défaut (mot de passe: technicien123)
INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role, specialite, actif) VALUES
('technicien@garage.com', '$2b$10$YourHashedPasswordHere', 'Martin', 'Pierre', 'technicien', 'Mécanique générale', TRUE);

-- Insertion d'un compte client par défaut (mot de passe: client123)
INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, telephone, adresse, role, notifications_acceptees) VALUES
('client@test.com', '$2b$10$YourHashedPasswordHere', 'Durand', 'Sophie', '0612345678', '1 Rue de la Paix, 75001 Paris', 'client', TRUE);

-- INDEX pour les performances
CREATE INDEX idx_vehicules_client ON vehicules(client_id);
CREATE INDEX idx_rdv_client ON rdv(client_id);
CREATE INDEX idx_rdv_vehicule ON rdv(vehicule_id);
CREATE INDEX idx_rdv_date ON rdv(date_heure);
CREATE INDEX idx_interventions_vehicule ON interventions(vehicule_id);
CREATE INDEX idx_interventions_technicien ON interventions(technicien_id);
CREATE INDEX idx_interventions_statut ON interventions(statut);
CREATE INDEX idx_vidanges_vehicule ON vidanges(vehicule_id);
CREATE INDEX idx_notifications_client ON notifications(client_id);
CREATE INDEX idx_notifications_statut ON notifications(statut);
CREATE INDEX idx_photos_intervention ON photos(intervention_id);
CREATE INDEX idx_factures_intervention ON factures(intervention_id);
CREATE INDEX idx_devis_intervention ON devis(intervention_id);