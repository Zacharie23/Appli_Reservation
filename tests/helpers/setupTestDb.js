// tests/helpers/setupTestDb.js

const sqlite3 = require('sqlite3').verbose();
const bcrypt  = require('bcrypt');

function createTestDb() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(':memory:', (err) => {
            if (err) return reject(err);

            db.serialize(() => {
                db.run(`CREATE TABLE users (
                    id       INTEGER PRIMARY KEY AUTOINCREMENT,
                    email    TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    nom      TEXT DEFAULT '',
                    prenom   TEXT DEFAULT '',
                    role     TEXT NOT NULL DEFAULT 'user'
                )`);

                db.run(`CREATE TABLE events (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    title       TEXT NOT NULL,
                    type        TEXT NOT NULL,
                    date        TEXT NOT NULL,
                    heure       TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    capacity    INTEGER NOT NULL
                )`);

                db.run(`CREATE TABLE categories (
                    id        INTEGER PRIMARY KEY AUTOINCREMENT,
                    name      TEXT NOT NULL,
                    price     REAL NOT NULL,
                    situation TEXT NOT NULL
                )`);

                db.run(`CREATE TABLE seats (
                    id          INTEGER PRIMARY KEY AUTOINCREMENT,
                    value       TEXT NOT NULL,
                    category_id INTEGER,
                    FOREIGN KEY (category_id) REFERENCES categories(id)
                )`);

                db.run(`CREATE TABLE reservations (
                    id         INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id    INTEGER NOT NULL,
                    event_id   INTEGER NOT NULL,
                    seat_id    INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(event_id, seat_id),
                    FOREIGN KEY (user_id)  REFERENCES users(id),
                    FOREIGN KEY (event_id) REFERENCES events(id),
                    FOREIGN KEY (seat_id)  REFERENCES seats(id)
                )`, async () => {
                    // Données de base
                    const hash = await bcrypt.hash('password123', 10);
                    const hashAdmin = await bcrypt.hash('admin123', 10);

                    db.run(`INSERT INTO users (email, password, nom, prenom, role)
                            VALUES ('user@test.com',  ?, 'Dupont', 'Jean', 'user')`,  [hash]);
                    db.run(`INSERT INTO users (email, password, nom, prenom, role)
                            VALUES ('admin@test.com', ?, 'Admin', 'Test', 'admin')`, [hashAdmin]);

                    db.run(`INSERT INTO events (title, type, date, heure, capacity)
                            VALUES ('Corrida Test', 'Corrida', '2026-08-15', '17:00', 5000)`);

                    db.run(`INSERT INTO categories (name, price, situation)
                            VALUES ('Tendido Barrera', 45.00, 'Ombre')`);

                    db.run(`INSERT INTO seats (value, category_id) VALUES ('A1', 1)`);
                    db.run(`INSERT INTO seats (value, category_id) VALUES ('A2', 1)`, () => {
                        resolve(db);
                    });
                });
            });
        });
    });
}

module.exports = { createTestDb };
