/**
 * Détecte si l'app tourne dans Electron.
 * Le user-agent contient "Electron" quand c'est le cas.
 */
export const isElectron = () =>
    typeof navigator !== 'undefined' &&
    navigator.userAgent.toLowerCase().includes('electron');

/**
 * Retourne true si l'utilisateur courant est autorisé dans Electron.
 * Seuls les comptes admin ont accès à l'app desktop.
 */
export const isAllowedInElectron = (user) => {
    if (!isElectron()) return true;          // Web : tout le monde passe
    return user?.role === 'admin';           // Electron : admin uniquement
};
