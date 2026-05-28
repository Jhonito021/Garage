-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 28 mai 2026 à 08:34
-- Version du serveur : 9.1.0
-- Version de PHP : 8.4.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `garage_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `configurations`
--

DROP TABLE IF EXISTS `configurations`;
CREATE TABLE IF NOT EXISTS `configurations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cle` varchar(100) NOT NULL,
  `valeur` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cle` (`cle`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `configurations`
--

INSERT INTO `configurations` (`id`, `cle`, `valeur`, `description`, `updated_at`) VALUES
(1, 'intervalle_vidange_defaut', '8000', 'Intervalle par défaut pour vidange (km)', '2026-05-28 08:28:12'),
(2, 'intervalle_ct_defaut', '2', 'Intervalle contrôle technique (années)', '2026-05-28 08:28:12'),
(3, 'heure_ouverture', '08:00', 'Heure d ouverture du garage', '2026-05-28 08:28:12'),
(4, 'heure_fermeture', '18:00', 'Heure de fermeture du garage', '2026-05-28 08:28:12'),
(5, 'seuil_relance_vidange', '2000', 'Déclencher alerte X km avant échéance', '2026-05-28 08:28:12'),
(6, 'tarif_vidange', '20', NULL, '2026-05-28 10:28:44'),
(7, 'tarif_ct', '', NULL, '2026-05-28 10:28:44'),
(8, 'tarif_entretien', '', NULL, '2026-05-28 10:28:44'),
(9, 'tarif_reparation', '', NULL, '2026-05-28 10:28:44'),
(10, 'tarif_pneumatiques', '50', NULL, '2026-05-28 10:32:15');

-- --------------------------------------------------------

--
-- Structure de la table `depannage_demandes`
--

DROP TABLE IF EXISTS `depannage_demandes`;
CREATE TABLE IF NOT EXISTS `depannage_demandes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `client_nom` varchar(100) NOT NULL,
  `client_prenom` varchar(100) NOT NULL,
  `client_email` varchar(150) DEFAULT NULL,
  `client_telephone` varchar(20) DEFAULT NULL,
  `technicien_id` int DEFAULT NULL,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `technicien_lat` decimal(10,8) DEFAULT NULL,
  `technicien_lng` decimal(11,8) DEFAULT NULL,
  `adresse` text,
  `statut` enum('en_attente','acceptee','refusee','terminee') DEFAULT 'en_attente',
  `date_demande` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_traitement` datetime DEFAULT NULL,
  `date_arrivee` datetime DEFAULT NULL,
  `distance_parcourue` decimal(10,2) DEFAULT NULL,
  `montant_facture` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `technicien_id` (`technicien_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `depannage_demandes`
--

INSERT INTO `depannage_demandes` (`id`, `client_id`, `client_nom`, `client_prenom`, `client_email`, `client_telephone`, `technicien_id`, `lat`, `lng`, `technicien_lat`, `technicien_lng`, `adresse`, `statut`, `date_demande`, `date_traitement`, `date_arrivee`, `distance_parcourue`, `montant_facture`) VALUES
(1, 4, 'Solonotiavina', 'Jhonito', 'jhonito021@gmail.com', '0385101400', NULL, -18.92995026, 47.50072842, NULL, NULL, NULL, 'en_attente', '2026-05-28 11:17:28', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `devis`
--

DROP TABLE IF EXISTS `devis`;
CREATE TABLE IF NOT EXISTS `devis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `intervention_id` int NOT NULL,
  `date_emission` date NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `statut` enum('envoyé','accepté','refusé') DEFAULT 'envoyé',
  `pdf_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_devis_intervention` (`intervention_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `factures`
--

DROP TABLE IF EXISTS `factures`;
CREATE TABLE IF NOT EXISTS `factures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `intervention_id` int NOT NULL,
  `date_emission` date NOT NULL,
  `montant_total` decimal(10,2) NOT NULL,
  `statut_paiement` enum('payé','impayé','acompte') DEFAULT 'impayé',
  `pdf_url` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_factures_intervention` (`intervention_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `factures`
--

INSERT INTO `factures` (`id`, `intervention_id`, `date_emission`, `montant_total`, `statut_paiement`, `pdf_url`, `created_at`, `updated_at`) VALUES
(1, 3, '2026-05-28', 50.00, 'impayé', NULL, '2026-05-28 10:38:01', '2026-05-28 10:38:01');

-- --------------------------------------------------------

--
-- Structure de la table `interventions`
--

DROP TABLE IF EXISTS `interventions`;
CREATE TABLE IF NOT EXISTS `interventions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicule_id` int NOT NULL,
  `technicien_id` int NOT NULL,
  `rdv_id` int DEFAULT NULL,
  `date_debut` datetime DEFAULT NULL,
  `date_fin` datetime DEFAULT NULL,
  `statut` enum('prévue','en_cours','terminée') DEFAULT 'prévue',
  `description` text,
  `type_prestation` varchar(100) DEFAULT NULL,
  `duree_totale` int DEFAULT NULL COMMENT 'durée en minutes',
  `prix_intervention` decimal(10,2) DEFAULT '0.00',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rdv_id` (`rdv_id`),
  KEY `idx_interventions_vehicule` (`vehicule_id`),
  KEY `idx_interventions_technicien` (`technicien_id`),
  KEY `idx_interventions_statut` (`statut`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `interventions`
--

INSERT INTO `interventions` (`id`, `vehicule_id`, `technicien_id`, `rdv_id`, `date_debut`, `date_fin`, `statut`, `description`, `type_prestation`, `duree_totale`, `prix_intervention`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 4, '2026-05-31 16:00:00', NULL, 'prévue', 'Contrôle technique', 'Contrôle technique', NULL, 0.00, '2026-05-28 10:03:15', '2026-05-28 10:03:15'),
(2, 1, 2, 5, '2026-05-28 10:09:25', '2026-05-28 10:09:39', 'terminée', 'Entretien courant', 'Entretien courant', 0, 0.00, '2026-05-28 10:08:57', '2026-05-28 10:09:39'),
(3, 3, 2, 6, '2026-05-28 10:36:05', '2026-05-28 10:36:50', 'terminée', 'Pneumatiques', 'Pneumatiques', 0, 50.00, '2026-05-28 10:34:38', '2026-05-28 10:36:50');

-- --------------------------------------------------------

--
-- Structure de la table `intervention_pieces`
--

DROP TABLE IF EXISTS `intervention_pieces`;
CREATE TABLE IF NOT EXISTS `intervention_pieces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `intervention_id` int NOT NULL,
  `piece_id` int NOT NULL,
  `quantite_utilisee` int NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_intervention_pieces_intervention` (`intervention_id`),
  KEY `idx_intervention_pieces_piece` (`piece_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `vehicule_id` int DEFAULT NULL,
  `message` text NOT NULL,
  `type` enum('vidange','ct','rappel') NOT NULL,
  `date_envoi` datetime DEFAULT CURRENT_TIMESTAMP,
  `statut` enum('envoyé','lu') DEFAULT 'envoyé',
  PRIMARY KEY (`id`),
  KEY `vehicule_id` (`vehicule_id`),
  KEY `idx_notifications_client` (`client_id`),
  KEY `idx_notifications_statut` (`statut`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `photos`
--

DROP TABLE IF EXISTS `photos`;
CREATE TABLE IF NOT EXISTS `photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `intervention_id` int NOT NULL,
  `url_photo` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_photos_intervention` (`intervention_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `pieces`
--

DROP TABLE IF EXISTS `pieces`;
CREATE TABLE IF NOT EXISTS `pieces` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `reference` varchar(50) NOT NULL,
  `quantite_stock` int NOT NULL DEFAULT '0',
  `seuil_alerte` int NOT NULL DEFAULT '5',
  `prix_unitaire` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `pieces`
--

INSERT INTO `pieces` (`id`, `nom`, `reference`, `quantite_stock`, `seuil_alerte`, `prix_unitaire`, `created_at`, `updated_at`) VALUES
(1, 'Filtre à huile', 'FIL-001', 10, 3, 12.50, '2026-05-28 09:16:52', '2026-05-28 09:16:52'),
(2, 'Huile moteur 5L', 'HUI-5L', 8, 2, 45.00, '2026-05-28 09:16:52', '2026-05-28 09:16:52');

-- --------------------------------------------------------

--
-- Structure de la table `rdv`
--

DROP TABLE IF EXISTS `rdv`;
CREATE TABLE IF NOT EXISTS `rdv` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `vehicule_id` int NOT NULL,
  `date_heure` datetime NOT NULL,
  `service_demande` varchar(100) NOT NULL,
  `statut` enum('confirmé','annulé','terminé') DEFAULT 'confirmé',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rdv_client` (`client_id`),
  KEY `idx_rdv_vehicule` (`vehicule_id`),
  KEY `idx_rdv_date` (`date_heure`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `rdv`
--

INSERT INTO `rdv` (`id`, `client_id`, `vehicule_id`, `date_heure`, `service_demande`, `statut`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-05-30 09:16:52', 'Vidange', 'confirmé', '2026-05-28 09:16:52', '2026-05-28 09:16:52'),
(2, 1, 1, '2026-05-30 09:26:43', 'Vidange', 'confirmé', '2026-05-28 09:26:43', '2026-05-28 09:26:43'),
(3, 4, 1, '2026-05-29 13:00:00', 'Contrôle technique', 'confirmé', '2026-05-28 09:32:30', '2026-05-28 09:32:30'),
(4, 4, 1, '2026-05-31 16:00:00', 'Contrôle technique', 'confirmé', '2026-05-28 09:54:31', '2026-05-28 09:54:31'),
(5, 4, 1, '2026-05-28 12:30:00', 'Entretien courant', 'confirmé', '2026-05-28 10:08:18', '2026-05-28 10:08:18'),
(6, 4, 3, '2026-05-29 10:30:00', 'Pneumatiques', 'confirmé', '2026-05-28 10:33:16', '2026-05-28 10:33:16');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

DROP TABLE IF EXISTS `utilisateurs`;
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `adresse` text,
  `role` enum('client','technicien','admin','caissier') DEFAULT 'client',
  `notifications_acceptees` tinyint(1) DEFAULT '1',
  `specialite` varchar(100) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `date_inscription` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `email`, `mot_de_passe`, `nom`, `prenom`, `telephone`, `adresse`, `role`, `notifications_acceptees`, `specialite`, `actif`, `date_inscription`, `created_at`, `updated_at`) VALUES
(1, 'admin@garage.com', '$2b$10$srTm971N6F8sgtgJjnY.p.dLTjb4lnJ8zgif77snd8.BXAxdvTJoC', 'Admin', 'Garage', NULL, NULL, 'admin', 1, NULL, 1, '2026-05-28 08:28:12', '2026-05-28 08:28:12', '2026-05-28 09:56:17'),
(2, 'technicien@garage.com', '$2b$10$55ePv1c/byEmjDIKT6u1LOHHegPArgLt4rVeLU.YK/KR7sVAyLUIO', 'Martin', 'Pierre', NULL, NULL, 'technicien', 1, 'Mécanique générale', 1, '2026-05-28 08:28:12', '2026-05-28 08:28:12', '2026-05-28 10:07:14'),
(3, 'client@test.com', '$2b$10$YourHashedPasswordHere', 'Durand', 'Sophie', '0612345678', '1 Rue de la Paix, 75001 Paris', 'client', 1, NULL, 1, '2026-05-28 08:28:12', '2026-05-28 08:28:12', '2026-05-28 08:28:12'),
(4, 'jhonito021@gmail.com', '$2b$10$woIDSvwgD6yT.GGyUBBC2O1p9jBWG8vbr4FWzpdhrzYozIqppkKkC', 'Solonotiavina', 'Jhonito', '0385101400', 'Itaosy', 'client', 1, NULL, 1, '2026-05-28 08:29:11', '2026-05-28 08:29:11', '2026-05-28 08:29:11');

-- --------------------------------------------------------

--
-- Structure de la table `vehicules`
--

DROP TABLE IF EXISTS `vehicules`;
CREATE TABLE IF NOT EXISTS `vehicules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `immatriculation` varchar(20) NOT NULL,
  `marque` varchar(50) NOT NULL,
  `modele` varchar(50) NOT NULL,
  `annee` int DEFAULT NULL,
  `type_carburant` varchar(30) DEFAULT NULL,
  `kilometrage_actuel` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `immatriculation` (`immatriculation`),
  KEY `idx_vehicules_client` (`client_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `vehicules`
--

INSERT INTO `vehicules` (`id`, `client_id`, `immatriculation`, `marque`, `modele`, `annee`, `type_carburant`, `kilometrage_actuel`, `created_at`, `updated_at`) VALUES
(1, 4, '1554TBE', 'Citroen', 'C4', 2006, 'Essence', 20000, '2026-05-28 08:31:50', '2026-05-28 08:31:50'),
(2, 1, 'AA-123-BB', 'Renault', 'Clio', 2020, 'Essence', 25000, '2026-05-28 09:16:51', '2026-05-28 09:16:51'),
(3, 4, '1554TCC', 'Mercendez-Benz', 'Sprinter', 2010, 'Diesel', 65000, '2026-05-28 10:31:44', '2026-05-28 10:36:49');

-- --------------------------------------------------------

--
-- Structure de la table `vidanges`
--

DROP TABLE IF EXISTS `vidanges`;
CREATE TABLE IF NOT EXISTS `vidanges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicule_id` int NOT NULL,
  `intervention_id` int NOT NULL,
  `date_vidange` date NOT NULL,
  `kilometrage` int NOT NULL,
  `type_huile` enum('synthétique','semi_synthétique','minérale') NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `intervention_id` (`intervention_id`),
  KEY `idx_vidanges_vehicule` (`vehicule_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `vidanges`
--

INSERT INTO `vidanges` (`id`, `vehicule_id`, `intervention_id`, `date_vidange`, `kilometrage`, `type_huile`, `created_at`) VALUES
(1, 1, 1, '2025-11-28', 15000, 'synthétique', '2026-05-28 09:16:52'),
(2, 1, 1, '2025-11-28', 15000, 'synthétique', '2026-05-28 09:26:43'),
(3, 3, 3, '2026-05-28', 65000, 'semi_synthétique', '2026-05-28 10:36:49');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
