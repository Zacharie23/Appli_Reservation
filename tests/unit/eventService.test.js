// tests/unit/eventService.test.js

const eventService = require('../../src/services/EventService');
const Event = require('../../src/models/EventModel');

jest.mock('../../src/models/EventModel');


describe('EventService.listEvents', () => {

    test('✅ retourne tous les événements', async () => {
        Event.getAll.mockResolvedValue([
            { id: 1, title: 'Corrida', type: 'Corrida' },
            { id: 2, title: 'Concert', type: 'Concert' },
        ]);

        const result = await eventService.listEvents();
        expect(result).toHaveLength(2);
    });


    test('✅ filtre les événements par titre', async () => {
        Event.getAll.mockResolvedValue([
            { id: 1, title: 'Corrida de printemps', type: 'Corrida' },
            { id: 2, title: 'Concert jazz', type: 'Concert' },
        ]);

        const result = await eventService.listEvents('corrida');
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Corrida de printemps');
    });

});


describe('EventService.patchEvent', () => {

    beforeEach(() => jest.clearAllMocks());

    test('✅ fusionne correctement les champs existants avec les nouveaux', async () => {
        Event.getAll.mockResolvedValue([{
            id: 1, title: 'Ancien titre', type: 'Corrida',
            date: '2026-07-01', heure: '17:00',
            description: 'Desc', capacity: 5000
        }]);
        Event.update.mockResolvedValue({ id: 1, title: 'Nouveau titre', type: 'Corrida' });

        await eventService.patchEvent(1, { title: 'Nouveau titre' });

        // Vérifie que update est appelé avec la fusion complète
        expect(Event.update).toHaveBeenCalledWith(1, expect.objectContaining({
            title: 'Nouveau titre',
            type: 'Corrida',        // conservé
            heure: '17:00',         // conservé
            capacity: 5000          // conservé
        }));
    });


    test('❌ retourne null si l\'événement n\'existe pas', async () => {
        Event.getAll.mockResolvedValue([]);

        const result = await eventService.patchEvent(999, { title: 'Test' });
        expect(result).toBeNull();
        expect(Event.update).not.toHaveBeenCalled();
    });

});
