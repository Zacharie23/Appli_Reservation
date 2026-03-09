const db = require('../db');

function getAll() {
    return new Promise((resolve, reject) => {
        db.all(`
        SELECT r.id, r.created_at,
                u.email AS user_email,
                e.title AS event_title, e.date AS event_date,
                s.value AS seat_value,
                c.name  AS category_name, c.price AS category_price, c.situation AS category_situation
        FROM reservations r
        JOIN users      u ON r.user_id  = u.id
        JOIN events     e ON r.event_id = e.id
        JOIN seats      s ON r.seat_id  = s.id
        JOIN categories c ON s.category_id = c.id
        `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
        });
    });
}

function getByUser(userId) {
    return new Promise((resolve, reject) => {
        db.all(`
        SELECT r.id, r.created_at,
                r.event_id, 
                e.title AS event_title, e.date AS event_date, e.heure AS event_heure,
                s.value AS seat_value,
                c.name  AS category_name, c.price AS category_price, c.situation AS category_situation
        FROM reservations r
        JOIN events     e ON r.event_id = e.id
        JOIN seats      s ON r.seat_id  = s.id
        JOIN categories c ON s.category_id = c.id
        WHERE r.user_id = ?
        `, [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
        });
    });
}

function getByEvent(eventId) {
    return new Promise((resolve, reject) => {
        db.all(`
        SELECT r.id, r.created_at,
                u.email AS user_email,
                s.value AS seat_value,
                c.name  AS category_name, c.price AS category_price, c.situation AS category_situation
        FROM reservations r
        JOIN users      u ON r.user_id  = u.id
        JOIN seats      s ON r.seat_id  = s.id
        JOIN categories c ON s.category_id = c.id
        WHERE r.event_id = ?
        `, [eventId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
        });
    });
}

function getById(id) {
    return new Promise((resolve, reject) => {
        db.get(`
        SELECT r.id, r.user_id, r.created_at,
                u.email AS user_email,
                e.title AS event_title, e.date AS event_date,
                s.value AS seat_value,
                c.name  AS category_name, c.price AS category_price, c.situation AS category_situation
        FROM reservations r
        JOIN users      u ON r.user_id  = u.id
        JOIN events     e ON r.event_id = e.id
        JOIN seats      s ON r.seat_id  = s.id
        JOIN categories c ON s.category_id = c.id
        WHERE r.id = ?
        `, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
        });
    });
}

function create(data) {
    return new Promise((resolve, reject) => {
        db.run(
        `INSERT INTO reservations (user_id, event_id, seat_id) VALUES (?, ?, ?)`,
        [data.user_id, data.event_id, data.seat_id],
        function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, ...data });
        }
        );
    });
}

function remove(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM reservations WHERE id = ?`, [id], function (err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
        });
    });
}

module.exports = { getAll, getByUser, getByEvent, getById, create, remove };