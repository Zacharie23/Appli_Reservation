const Seat = require('../models/SeatModel');
const db = require('../db');

async function listSeats() {
    return await Seat.getAll();
}

async function listAvailableByEvent(eventId) {
    // Vérifier que l'event existe
    const eventExists = await new Promise((resolve, reject) => {
        db.get(`SELECT id FROM events WHERE id = ?`, [eventId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
        });
    });
    if (!eventExists) throw { status: 404, message: 'Événement non trouvé' };

    return await Seat.getAvailableByEvent(eventId);
}

module.exports = { listSeats, listAvailableByEvent };
