const reservationService = require('../services/ReservationService');

async function getReservations(req, res, next) {
    try {
        const reservations = await reservationService.listReservations();
        res.json(reservations);
    } catch (err) {
        next(err);
    }
}

async function getMyReservations(req, res, next) {
    try {
        const reservations = await reservationService.listByUser(req.user.id);
        res.json(reservations);
    } catch (err) {
        next(err);
    }
}

async function getReservationsByEvent(req, res, next) {
    try {
        const reservations = await reservationService.listByEvent(parseInt(req.params.eventId));
        res.json(reservations);
    } catch (err) {
        next(err);
    }
}

async function getReservationById(req, res, next) {
    try {
        const reservation = await reservationService.getReservation(parseInt(req.params.id));
        res.json(reservation);
    } catch (err) {
        next(err);
    }
}

async function createReservation(req, res, next) {
    try {
        // On force le user_id à partir du token JWT, pas du body
        const data = {
        user_id:  req.user.id,
        event_id: req.body.event_id,
        seat_id:  req.body.seat_id,
        };
        const reservation = await reservationService.createReservation(data);
        res.status(201).json(reservation);
    } catch (err) {
        next(err);
    }
}

async function deleteReservation(req, res, next) {
    try {
        await reservationService.deleteReservation(parseInt(req.params.id), req.user);
        res.json({ message: 'Réservation supprimée avec succès' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getReservations, getMyReservations, getReservationsByEvent, getReservationById, createReservation, deleteReservation };
