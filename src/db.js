const bcrypt = require('bcrypt');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur connexion', err.message);
    } else {
        console.log('Connexion réussie');
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user'
            )
            `, (err) => {
            if (err) console.error("Erreur création table:", err.message);
            else {
                console.log("Table 'users' prête !");
                const insert = `INSERT INTO users (email, password, role) VALUES (?, ?, ?)`;

                const users = [
                { email: 'romainsintas@gmail.com', password: bcrypt.hashSync('Romain123', 10), role: 'admin' },
                { email: 'zachariechamard6@gmail.com', password: bcrypt.hashSync('Zach123', 10), role: 'user' }
                ];

                users.forEach(u => {
                db.run(insert, [u.email, u.password, u.role], (err) => {
                    if (err) {
                    if (err.message.includes("UNIQUE constraint")) {
                        console.log(`Utilisateur ${u.email} déjà présent`);
                    } else {
                        console.error(err.message);
                    }
                    } else {
                    console.log(`Utilisateur ${u.email} inséré !`);
                    }
                });
                });
            }
            });
    }
});

module.exports = db;