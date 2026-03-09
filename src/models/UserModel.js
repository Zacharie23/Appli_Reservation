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

async function create(email, password, nom, prenom, role = 'user') {
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

function findAll() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, email, nom, prenom, role FROM users ORDER BY id ASC';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function update(id, { email, password, nom, prenom, role }) {
    const fields = [];
    const values = [];

    if (email !== undefined)  { fields.push('email = ?');  values.push(email); }
    if (nom !== undefined)    { fields.push('nom = ?');    values.push(nom); }
    if (prenom !== undefined) { fields.push('prenom = ?'); values.push(prenom); }
    if (role !== undefined)   { fields.push('role = ?');   values.push(role); }
    if (password)             {
        const hashed = await bcrypt.hash(password, 10);
        fields.push('password = ?');
        values.push(hashed);
    }

    if (fields.length === 0) throw new Error('Aucun champ à mettre à jour');

    values.push(id);

    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values,
            function (err) {
                if (err) reject(err);
                else if (this.changes === 0) reject(new Error('Utilisateur introuvable'));
                else resolve({ id, email, nom, prenom, role });
            }
        );
    });
}

function remove(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
            if (err) reject(err);
            else if (this.changes === 0) reject(new Error('Utilisateur introuvable'));
            else resolve({ deleted: true });
        });
    });
}

module.exports = {
    findByEmail,
    findById,
    findAll,
    update,
    remove,
    verifyPassword,
    create
};