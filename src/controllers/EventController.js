// Appeler le bon service et renvoyer la réponse.
// 1 fichier par ressource

const eventService = require('../services/EventService');

async function getEvents(req, res) {
  const events = await eventService.listEvents(req.query.title);
  res.json(events);
}

async function getEventById(req, res) {
  const events = await eventService.listEvents(req.query.title);
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ message: 'Event pas trouvé' });
  }
}

async function createEvent(req, res) {
  const newEvent = await eventService.createEvent(req.body);
  res.status(201).json(newEvent);
}

async function updateEvent(req, res) {
  const updatedEvent = await eventService.updateEvent(parseInt(req.params.id), req.body);
  if (updatedEvent) {
    res.json(updatedEvent);
  } else {
    res.status(404).json({ message: 'Event pas trouvé' });
  }
}

async function patchEvent(req, res) {
  const updatedEvent = await eventService.patchEvent(parseInt(req.params.id), req.body);
  if (updatedEvent) {
    res.json(updatedEvent);
  } else {
    res.status(404).json({ message: 'Event pas trouvé' });
  }
}

async function deleteEvent(req, res) {
  const deleted = await eventService.deleteEvent(parseInt(req.params.id));
  if (deleted) {
    res.json({ message: 'Event supprimé avec succès' });
  } else {
    res.status(404).json({ message: 'Event pas trouvé' });
  }
}

module.exports = { getEvents, getEventById, createEvent, updateEvent, patchEvent, deleteEvent };