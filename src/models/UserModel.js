const bcrypt = require('bcrypt');
const db = require('../db');


function findByEmail(email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}


function findById(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}


async function verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}


async function create(email, password, nom, prenom, role = 'user') {  // ← nom + prenom
    const hashed = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)`,
            [email, hashed, nom, prenom, role],
            function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, email, nom, prenom, role });
            }
        );
    });
}


module.exports = {
    findByEmail,
    findById,
    verifyPassword,
    create
};
