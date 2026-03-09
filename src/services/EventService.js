const Event = require('../models/EventModel');

async function listEvents(filters = {}, { limit = 6, offset = 0 } = {}) {
    const { title = null, type = null } = filters;
    const [events, total] = await Promise.all([
        Event.getAll({ limit, offset, title, type }),
        Event.count({ title, type })
    ]);
    return { events, total, limit, offset };
}

async function getEventById(id) {
    const event = await Event.getById(id);
    if (!event) throw { status: 404, message: 'Événement non trouvé' };
    return event;
}

async function createEvent(data) {
    return await Event.create(data);
}

async function updateEvent(id, data) {
    return await Event.update(id, data);
}

async function patchEvent(id, data) {
    const existing = await Event.getById(id);
    if (!existing) return null;
    const merged = {
        title:       data.title       ?? existing.title,
        type:        data.type        ?? existing.type,
        date:        data.date        ?? existing.date,
        heure:       data.heure       ?? existing.heure,
        description: data.description ?? existing.description,
        capacity:    data.capacity    ?? existing.capacity,
    };
    return await Event.update(id, merged);
}

async function deleteEvent(id) {
    return await Event.remove(id);
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, patchEvent, deleteEvent };