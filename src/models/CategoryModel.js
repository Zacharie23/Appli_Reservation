const db = require('../db');

function getAll() {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM categories`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
        });
    });
}

function getById(id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM categories WHERE id = ?`, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
        });
    });
}

module.exports = { getAll, getById };
