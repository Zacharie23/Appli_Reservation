const Reservation = require('../models/ReservationModel');
const db = require('../db');

async function listReservations() {
    return await Reservation.getAll();
}

async function listByUser(userId) {
    return await Reservation.getByUser(userId);
}

async function listByEvent(eventId) {
    return await Reservation.getByEvent(eventId);
}

async function getReservation(id) {
    const reservation = await Reservation.getById(id);
    if (!reservation) throw { status: 404, message: 'Réservation non trouvée' };
    return reservation;
}

async function createReservation(data) {
    const seatExists = await new Promise((resolve, reject) => {
        db.get(`SELECT id FROM seats WHERE id = ?`, [data.seat_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
        });
    });
    if (!seatExists) throw { status: 404, message: 'Place non trouvée' };

    const eventExists = await new Promise((resolve, reject) => {
        db.get(`SELECT id FROM events WHERE id = ?`, [data.event_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
        });
    });
    if (!eventExists) throw { status: 404, message: 'Événement non trouvé' };

    try {
        return await Reservation.create(data);
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
        throw { status: 409, message: 'Cette place est déjà réservée pour cet événement' };
        }
        throw err;
    }
}

async function deleteReservation(id, requestingUser) {
    const reservation = await Reservation.getById(id);
    if (!reservation) throw { status: 404, message: 'Réservation non trouvée' };

    if (requestingUser.role !== 'admin' && reservation.user_id !== requestingUser.id) {
        throw { status: 403, message: 'Vous ne pouvez pas supprimer cette réservation' };
    }

    return await Reservation.remove(id);
}

module.exports = { listReservations, listByUser, listByEvent, getReservation, createReservation, deleteReservation };