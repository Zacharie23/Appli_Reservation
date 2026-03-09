const db = require('../db');

function getAll() {
    return new Promise((resolve, reject) => {
        db.all(`
        SELECT s.id, s.value, c.id AS category_id, c.name, c.price, c.situation
        FROM seats s
        JOIN categories c ON s.category_id = c.id
        `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
        });
    });
}

function getAvailableByEvent(eventId) {
    return new Promise((resolve, reject) => {
        db.all(`
        SELECT s.id, s.value, c.id AS category_id, c.name, c.price, c.situation
        FROM seats s
        JOIN categories c ON s.category_id = c.id
        WHERE s.id NOT IN (
            SELECT seat_id FROM reservations WHERE event_id = ?
        )
        `, [eventId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
        });
    });
}

module.exports = { getAll, getAvailableByEvent };