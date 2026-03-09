const eventService = require('../services/EventService');

async function getEvents(req, res, next) {
    try {
        let limit  = parseInt(req.query.limit, 10);
        let offset = parseInt(req.query.offset, 10);
        if (isNaN(limit)  || limit  <= 0) limit  = 6;
        if (isNaN(offset) || offset <  0) offset = 0;

        const filters = {
            title: req.query.title || null,
            type:  req.query.type  || null,
        };

        const result = await eventService.listEvents(filters, { limit, offset });
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function getEventById(req, res, next) {
    try {
        const event = await eventService.getEventById(parseInt(req.params.id));
        res.json(event);
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        next(err);
    }
}

async function createEvent(req, res, next) {
    try {
        const newEvent = await eventService.createEvent(req.body);
        res.status(201).json(newEvent);
    } catch (err) {
        next(err);
    }
}

async function updateEvent(req, res, next) {
    try {
        const updatedEvent = await eventService.updateEvent(parseInt(req.params.id), req.body);
        if (updatedEvent) res.json(updatedEvent);
        else res.status(404).json({ message: 'Événement non trouvé' });
    } catch (err) {
        next(err);
    }
}

async function patchEvent(req, res, next) {
    try {
        const updatedEvent = await eventService.patchEvent(parseInt(req.params.id), req.body);
        if (updatedEvent) res.json(updatedEvent);
        else res.status(404).json({ message: 'Événement non trouvé' });
    } catch (err) {
        next(err);
    }
}

async function deleteEvent(req, res, next) {
    try {
        const deleted = await eventService.deleteEvent(parseInt(req.params.id));
        if (deleted) res.json({ message: 'Événement supprimé avec succès' });
        else res.status(404).json({ message: 'Événement non trouvé' });
    } catch (err) {
        next(err);
    }
}

module.exports = { getEvents, getEventById, createEvent, updateEvent, patchEvent, deleteEvent };