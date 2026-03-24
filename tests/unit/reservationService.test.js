const reservationService = require('../../src/services/ReservationService');
const Reservation = require('../../src/models/ReservationModel');
const db = require('../../src/db');

jest.mock('../../src/models/ReservationModel');
jest.mock('../../src/db', () => ({
    get: jest.fn(),
}));


describe('ReservationService.createReservation', () => {

    beforeEach(() => jest.clearAllMocks());

    test('✅ crée une réservation si la place et l\'event existent', async () => {
        db.get
            .mockImplementationOnce((sql, params, cb) => cb(null, { id: 1 }))
            .mockImplementationOnce((sql, params, cb) => cb(null, { id: 1 }));

        Reservation.create.mockResolvedValue({ id: 10, user_id: 1, event_id: 1, seat_id: 1 });

        const result = await reservationService.createReservation({
            user_id: 1, event_id: 1, seat_id: 1
        });

        expect(result).toEqual({ id: 10, user_id: 1, event_id: 1, seat_id: 1 });
        expect(Reservation.create).toHaveBeenCalledTimes(1);
    });

    test('❌ lance une erreur 404 si la place n\'existe pas', async () => {
        db.get.mockImplementationOnce((sql, params, cb) => cb(null, null));

        await expect(
            reservationService.createReservation({ user_id: 1, event_id: 1, seat_id: 999 })
        ).rejects.toMatchObject({ status: 404, message: 'Place non trouvée' });

        expect(Reservation.create).not.toHaveBeenCalled();
    });

    test('❌ lance une erreur 404 si l\'événement n\'existe pas', async () => {
        db.get
            .mockImplementationOnce((sql, params, cb) => cb(null, { id: 1 }))
            .mockImplementationOnce((sql, params, cb) => cb(null, null));

        await expect(
            reservationService.createReservation({ user_id: 1, event_id: 999, seat_id: 1 })
        ).rejects.toMatchObject({ status: 404, message: 'Événement non trouvé' });

        expect(Reservation.create).not.toHaveBeenCalled();
    });

    test('❌ lance une erreur 409 si la place est déjà réservée (règle métier)', async () => {
        db.get
            .mockImplementationOnce((sql, params, cb) => cb(null, { id: 1 }))
            .mockImplementationOnce((sql, params, cb) => cb(null, { id: 1 }));

        Reservation.create.mockRejectedValue(
            new Error('UNIQUE constraint failed: reservations.event_id, reservations.seat_id')
        );

        await expect(
            reservationService.createReservation({ user_id: 1, event_id: 1, seat_id: 1 })
        ).rejects.toMatchObject({
            status: 409,
            message: 'Cette place est déjà réservée pour cet événement'
        });
    });

});


describe('ReservationService.deleteReservation', () => {

    beforeEach(() => jest.clearAllMocks());

    test('✅ le propriétaire peut annuler sa réservation', async () => {
        Reservation.getById.mockResolvedValue({ id: 5, user_id: 1 });
        Reservation.remove.mockResolvedValue(true);

        const result = await reservationService.deleteReservation(5, { id: 1, role: 'user' });
        expect(result).toBe(true);
        expect(Reservation.remove).toHaveBeenCalledWith(5);
    });

    test('✅ un admin peut annuler n\'importe quelle réservation', async () => {
        Reservation.getById.mockResolvedValue({ id: 5, user_id: 2 });
        Reservation.remove.mockResolvedValue(true);

        const result = await reservationService.deleteReservation(5, { id: 99, role: 'admin' });
        expect(result).toBe(true);
    });

    test('❌ un user ne peut pas annuler la réservation d\'un autre (→ 403)', async () => {
        Reservation.getById.mockResolvedValue({ id: 5, user_id: 2 });

        await expect(
            reservationService.deleteReservation(5, { id: 1, role: 'user' })
        ).rejects.toMatchObject({ status: 403 });

        expect(Reservation.remove).not.toHaveBeenCalled();
    });

    test('❌ lance une erreur 404 si la réservation n\'existe pas', async () => {
        Reservation.getById.mockResolvedValue(null);

        await expect(
            reservationService.deleteReservation(999, { id: 1, role: 'user' })
        ).rejects.toMatchObject({ status: 404, message: 'Réservation non trouvée' });
    });

});