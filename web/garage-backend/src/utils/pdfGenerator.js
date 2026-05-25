const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// S'assurer que le dossier pdfs existe
const pdfsDir = path.join(__dirname, '../../pdfs');
if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
}

const generateFacturePDF = async (facture, pieces = []) => {
    return new Promise((resolve, reject) => {
        const filename = `facture_${facture.id}_${Date.now()}.pdf`;
        const filepath = path.join(pdfsDir, filename);
        
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filepath);
        
        doc.pipe(stream);
        
        // En-tête
        doc.fontSize(24).font('Helvetica-Bold').text('FACTURE', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Date d'émission: ${new Date(facture.date_emission).toLocaleDateString('fr-FR')}`, { align: 'right' });
        doc.text(`Facture N°: ${facture.id}`, { align: 'right' });
        doc.moveDown(1);
        
        // Informations du garage
        doc.fontSize(12).font('Helvetica-Bold').text('Garage Pro', { underline: true });
        doc.fontSize(10).font('Helvetica').text('123 Rue du Garage');
        doc.text('75001 Paris');
        doc.text('Tél: 01 23 45 67 89');
        doc.moveDown(1);
        
        // Informations client
        doc.fontSize(12).font('Helvetica-Bold').text('Facturé à :');
        doc.fontSize(10).font('Helvetica');
        doc.text(`${facture.prenom} ${facture.nom}`);
        doc.text(facture.adresse || 'Adresse non renseignée');
        doc.text(`Email: ${facture.email}`);
        doc.moveDown(1);
        
        // Informations véhicule
        doc.fontSize(12).font('Helvetica-Bold').text('Véhicule concerné :');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Marque/Modèle: ${facture.marque} ${facture.modele}`);
        doc.text(`Immatriculation: ${facture.immatriculation}`);
        doc.moveDown(1);
        
        // Détail de l'intervention
        doc.fontSize(12).font('Helvetica-Bold').text('Intervention :');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Description: ${facture.description || 'Intervention'}`);
        doc.moveDown(0.5);
        
        // Tableau des pièces
        if (pieces && pieces.length > 0) {
            doc.fontSize(12).font('Helvetica-Bold').text('Pièces utilisées :');
            doc.moveDown(0.5);
            
            // En-tête du tableau
            let y = doc.y;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Nom', 50, y);
            doc.text('Référence', 200, y);
            doc.text('Qté', 350, y);
            doc.text('Prix unitaire', 400, y);
            doc.text('Total', 480, y);
            doc.moveDown(0.5);
            
            doc.fontSize(10).font('Helvetica');
            let totalPieces = 0;
            
            pieces.forEach(piece => {
                y = doc.y;
                const total = piece.prix_unitaire * piece.quantite_utilisee;
                totalPieces += total;
                
                doc.text(piece.nom.substring(0, 30), 50, y);
                doc.text(piece.reference, 200, y);
                doc.text(piece.quantite_utilisee.toString(), 350, y);
                doc.text(`${piece.prix_unitaire.toFixed(2)} €`, 400, y);
                doc.text(`${total.toFixed(2)} €`, 480, y);
                doc.moveDown(0.5);
            });
            
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`Total pièces: ${totalPieces.toFixed(2)} €`, 400, doc.y);
            doc.moveDown(1);
        }
        
        // Total
        const prixIntervention = parseFloat(facture.prix_intervention) || 0;
        const totalPiecesCalculated = pieces.reduce((sum, p) => sum + (p.prix_unitaire * p.quantite_utilisee), 0);
        const montantTotal = prixIntervention + totalPiecesCalculated;
        
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Récapitulatif :', 50, doc.y);
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Prestation: ${prixIntervention.toFixed(2)} €`, 50, doc.y);
        doc.text(`Pièces: ${totalPiecesCalculated.toFixed(2)} €`, 50, doc.y);
        doc.moveDown(0.5);
        
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text(`TOTAL TTC: ${montantTotal.toFixed(2)} €`, 50, doc.y);
        doc.moveDown(2);
        
        // Pied de page
        doc.fontSize(8).font('Helvetica');
        doc.text('Merci de votre confiance', 50, 750, { align: 'center' });
        
        doc.end();
        
        stream.on('finish', () => {
            resolve(filepath);
        });
        
        stream.on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = { generateFacturePDF };