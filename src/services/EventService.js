const Event = require('../models/EventModel');

async function listEvents(title) {
  const all = await Event.getAll();
  if (title) {
    return all.filter(a => a.title.toLowerCase().includes(title.toLowerCase()));
  }
  return all;
}

async function createEvent(data) {
  const newEvent = await Event.create(data);
  return newEvent;
}

async function updateEvent(id, data) {
  const updatedEvent = await Event.update(id, data);
  return updatedEvent;
}

async function patchEvent(id, data) {
  const all = await Event.getAll();
  const existing = all.find(e => e.id === id);
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
  const deleted = await Event.remove(id);
  return deleted;
}

module.exports = { listEvents, createEvent, updateEvent, patchEvent, deleteEvent };