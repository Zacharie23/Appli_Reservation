const eventService = require('../../src/services/EventService');
const Event = require('../../src/models/EventModel');

jest.mock('../../src/models/EventModel');


describe('EventService.listEvents', () => {

    test('✅ retourne tous les événements', async () => {
        Event.getAll.mockResolvedValue([
            { id: 1, title: 'Corrida', type: 'Corrida' },
            { id: 2, title: 'Concert', type: 'Concert' },
        ]);
        Event.count.mockResolvedValue(2);

        const result = await eventService.listEvents();
        expect(result.events).toHaveLength(2);
        expect(result.total).toBe(2);
    });

    test('✅ filtre les événements par titre', async () => {
        Event.getAll.mockResolvedValue([
            { id: 1, title: 'Corrida de printemps', type: 'Corrida' },
        ]);
        Event.count.mockResolvedValue(1);

        const result = await eventService.listEvents({ title: 'corrida' });
        expect(result.events).toHaveLength(1);
        expect(result.events[0].title).toBe('Corrida de printemps');
    });

});


describe('EventService.patchEvent', () => {

    beforeEach(() => jest.clearAllMocks());

    test('✅ fusionne correctement les champs existants avec les nouveaux', async () => {
        Event.getById.mockResolvedValue({
            id: 1, title: 'Ancien titre', type: 'Corrida',
            date: '2026-07-01', heure: '17:00',
            description: 'Desc', capacity: 5000
        });
        Event.update.mockResolvedValue({ id: 1, title: 'Nouveau titre' });

        await eventService.patchEvent(1, { title: 'Nouveau titre' });

        expect(Event.update).toHaveBeenCalledWith(1, expect.objectContaining({
            title: 'Nouveau titre',
            type: 'Corrida',
            heure: '17:00',
            capacity: 5000
        }));
    });

    test('❌ retourne null si l\'événement n\'existe pas', async () => {
        Event.getById.mockResolvedValue(null);

        const result = await eventService.patchEvent(999, { title: 'Test' });
        expect(result).toBeNull();
        expect(Event.update).not.toHaveBeenCalled();
    });

});