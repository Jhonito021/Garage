# Guide de Résolution - Erreur 401 Unauthorized

## Problème
Erreur `401 (Unauthorized)` lors de la tentative de connexion à l'API.

## Causes Identifiées et Corrigées

### 1. ✅ Paramètres d'authentification incorrects
- **Problème**: Les écrans de connexion Dépanneur et Technicien envoyaient `password` au lieu de `mot_de_passe`
- **Solution**: Corrigé dans tous les LoginScreens pour utiliser `mot_de_passe`

### 2. ✅ Vérification des réponses
- **Problème**: Les réponses n'étaient pas vérifiées correctement
- **Solution**: Ajout de vérification du status HTTP et du champ `user`

### 3. ✅ Données manquantes dans la base de données
- **Problème**: Aucun utilisateur de test n'existait dans la base
- **Solution**: Créé un script d'initialisation automatique

## Instructions de Configuration

### Étape 1: Initialiser les Données de Test

```bash
cd d:\Projet\GarageP\mobile\backend-mobile
npm run init-data
```

Cela créera 3 utilisateurs de test:
- **Client**: `client@test.com` / `password123`
- **Dépanneur**: `depanneur@test.com` / `password123`
- **Technicien**: `technicien@test.com` / `password123`

### Étape 2: Démarrer le Backend

```bash
npm run dev
```

### Étape 3: Tester la Connexion

Utilisez les identifiants de test ci-dessus pour vous connecter.

## Fichiers Modifiés

### Frontend
- `src/screens/auth/LoginScreen.jsx` - Correction du paramètre `mot_de_passe`
- `src/screens/depanneur/DepanneurLoginScreen.jsx` - Correction du paramètre `mot_de_passe`
- `src/screens/technicien/TechnicienLoginScreen.jsx` - Correction du paramètre `mot_de_passe`

### Backend
- `initializeData.js` - Script d'initialisation des données de test
- `package.json` - Ajout du script `npm run init-data`
- `src/controllers/authController.js` - Support du filtre par rôle

## Points Clés du Flux d'Authentification

```javascript
// Frontend envoie
POST /api/auth/login
{
  email: "client@test.com",
  mot_de_passe: "password123",
  role?: "client|depanneur|technicien"  // optionnel
}

// Backend retourne
{
  success: true,
  user: {
    id: 1,
    email: "...",
    nom: "...",
    prenom: "...",
    role: "...",
    telephone: "...",
    adresse: "..."
  }
}
```

## Dépannage

### Si vous recevez toujours 401
1. Vérifiez que MySQL est en cours d'exécution
2. Vérifiez les identifiants dans `.env`
3. Vérifiez que les données de test ont été créées: `npm run init-data`
4. Vérifiez les logs du serveur pour plus de détails

### Si la base de données n'existe pas
Créez-la avec:
```sql
CREATE DATABASE garage_db;
```

Et importez le schéma à partir de `db/schema.sql`
