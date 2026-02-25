const seatService = require('../services/SeatService');

async function getSeats(req, res, next) {
    try {
        const seats = await seatService.listSeats();
        res.json(seats);
    } catch (err) {
        next(err);
    } 
}

async function getAvailableSeats(req, res, next) {
    try {
        const seats = await seatService.listAvailableByEvent(parseInt(req.params.eventId));
        res.json(seats);
    } catch (err) {
        next(err);
    }
}

module.exports = { getSeats, getAvailableSeats };
