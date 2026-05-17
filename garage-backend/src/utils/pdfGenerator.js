const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateFacturePDF = async (facture) => {
    return new Promise((resolve, reject) => {
        const filename = `facture_${facture.id}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../pdfs', filename);
        
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filepath);
        
        doc.pipe(stream);
        
        doc.fontSize(20).text('FACTURE', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Numéro : ${facture.id}`);
        doc.text(`Date : ${facture.date_emission}`);
        doc.moveDown();
        doc.text(`Client : ${facture.nom} ${facture.prenom}`);
        doc.text(`Adresse : ${facture.adresse || 'Non renseignée'}`);
        doc.moveDown();
        doc.text(`Véhicule : ${facture.immatriculation}`);
        doc.text(`Description : ${facture.description || 'Intervention'}`);
        doc.moveDown();
        doc.fontSize(14).text(`Montant total : ${facture.montant_total} €`, { align: 'right' });
        
        doc.end();
        
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

const generateDevisPDF = async (devis) => {
    return new Promise((resolve, reject) => {
        const filename = `devis_${devis.id}_${Date.now()}.pdf`;
        const filepath = path.join(__dirname, '../../pdfs', filename);
        
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filepath);
        
        doc.pipe(stream);
        
        doc.fontSize(20).text('DEVIS', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Numéro : ${devis.id}`);
        doc.text(`Date : ${devis.date_emission}`);
        doc.moveDown();
        doc.text(`Client : ${devis.nom} ${devis.prenom}`);
        doc.moveDown();
        doc.text(`Véhicule : ${devis.immatriculation}`);
        doc.text(`Description : ${devis.description || 'Prestation'}`);
        doc.moveDown();
        doc.fontSize(14).text(`Montant estimé : ${devis.montant} €`, { align: 'right' });
        
        doc.end();
        
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
    });
};

module.exports = { generateFacturePDF, generateDevisPDF };