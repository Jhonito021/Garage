const bcrypt = require('bcrypt');

const generateHash = async () => {
    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashTechnicien = await bcrypt.hash('technicien123', 10);
    const hashClient = await bcrypt.hash('123456', 10);
    
    console.log('Admin (admin123):', hashAdmin);
    console.log('Technicien (technicien123):', hashTechnicien);
    console.log('Client (123456):', hashClient);
};

generateHash();