const db = require('../db');

function getAll({ limit = 6, offset = 0, title = null, type = null } = {}) {
    return new Promise((resolve, reject) => {
        const conditions = [];
        const params = [];

        if (title) {
            conditions.push('LOWER(title) LIKE LOWER(?)');
            params.push(`%${title}%`);
        }
        if (type) {
            conditions.push('LOWER(type) = LOWER(?)');
            params.push(type);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        params.push(limit, offset);

        db.all(
            `SELECT * FROM events ${where} ORDER BY date ASC LIMIT ? OFFSET ?`,
            params,
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
}

function count({ title = null, type = null } = {}) {
    return new Promise((resolve, reject) => {
        const conditions = [];
        const params = [];

        if (title) {
            conditions.push('LOWER(title) LIKE LOWER(?)');
            params.push(`%${title}%`);
        }
        if (type) {
            conditions.push('LOWER(type) = LOWER(?)');
            params.push(type);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        db.get(
            `SELECT COUNT(*) AS total FROM events ${where}`,
            params,
            (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            }
        );
    });
}

function getById(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row || null);
        });
    });
}

function create(data) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO events (title, type, date, heure, description, capacity) VALUES (?, ?, ?, ?, ?, ?)',
            [data.title, data.type, data.date, data.heure, data.description, data.capacity],
            function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            }
        );
    });
}

function update(id, data) {
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE events SET title = ?, type = ?, date = ?, heure = ?, description = ?, capacity = ? WHERE id = ?',
            [data.title, data.type, data.date, data.heure, data.description, data.capacity, id],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes ? { id, ...data } : null);
            }
        );
    });
}

function patch(id, data) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE events SET
                title       = COALESCE(?, title),
                type        = COALESCE(?, type),
                date        = COALESCE(?, date),
                heure       = COALESCE(?, heure),
                description = COALESCE(?, description),
                capacity    = COALESCE(?, capacity)
              WHERE id = ?`,
            [data.title, data.type, data.date, data.heure, data.description, data.capacity, id],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes ? { id, ...data } : null);
            }
        );
    });
}

function remove(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM events WHERE id = ?', [id], function (err) {
            if (err) reject(err);
            else resolve(this.changes > 0);
        });
    });
}

module.exports = { getAll, count, getById, create, update, patch, remove };