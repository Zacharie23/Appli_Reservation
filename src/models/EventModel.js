const db = require('../db');

function getAll() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM events', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function create(data) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO events (title, type, date, heure, description, capacity) VALUES (?, ?, ?, ?, ?, ?)',
      [data.title, data.type, data.date, data.heure, data.description, data.capacity],
      function(err) {
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
      function(err) {
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
        title = COALESCE(?, title),
        type = COALESCE(?, type),
        date = COALESCE(?, date),
        heure = COALESCE(?, heure),
        description = COALESCE(?, description),
        capacity = COALESCE(?, capacity)
      WHERE id = ?`,
      [data.title, data.type, data.date, data.heure, data.description, data.capacity, id],
      function(err) {
        if (err) reject(err);
        else resolve(this.changes ? { id, ...data } : null);
      }
    );
  });
}

function remove(id) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
      if (err) reject(err);
      else resolve(this.changes > 0);
    });
  });
}

module.exports = { getAll, create, update, patch, remove };