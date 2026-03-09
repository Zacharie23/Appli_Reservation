const validate = require('./ValidationMiddleware');


const schemas = {

    login: validate({
        email:    { required: true,  type: 'string', minLength: 5 },
        password: { required: true,  type: 'string', minLength: 6 },
    }),

    register: validate({
        email:    { required: true,  type: 'string', minLength: 5 },
        password: { required: true,  type: 'string', minLength: 6 },
        nom:      { required: true,  type: 'string', minLength: 2, maxLength: 50 },
        prenom:   { required: true,  type: 'string', minLength: 2, maxLength: 50 },
    }),

    createUser: validate({
        email:    { required: true,  type: 'string', minLength: 5 },
        password: { required: true,  type: 'string', minLength: 6 },
        nom:      { required: false, type: 'string', minLength: 2, maxLength: 50 },
        prenom:   { required: false, type: 'string', minLength: 2, maxLength: 50 },
        role:     { required: false, type: 'string', enum: ['user', 'admin'] },
    }),

    updateUser: validate({
        email:    { required: false, type: 'string', minLength: 5 },
        password: { required: false, type: 'string', minLength: 6 },
        nom:      { required: false, type: 'string', minLength: 2, maxLength: 50 },
        prenom:   { required: false, type: 'string', minLength: 2, maxLength: 50 },
        role:     { required: false, type: 'string', enum: ['user', 'admin'] },
    }),

    createEvent: validate({
        title:       { required: true,  type: 'string', minLength: 2, maxLength: 100 },
        type:        { required: true,  type: 'string' },
        date:        { required: true,  type: 'string' },
        heure:       { required: true,  type: 'string' },
        description: { required: false, type: 'string', maxLength: 500 },
        capacity:    { required: true,  type: 'number', min: 1 },
    }),

    patchEvent: validate({
        title:       { required: false, type: 'string', minLength: 2, maxLength: 100 },
        type:        { required: false, type: 'string' },
        date:        { required: false, type: 'string' },
        heure:       { required: false, type: 'string' },
        description: { required: false, type: 'string', maxLength: 500 },
        capacity:    { required: false, type: 'number', min: 1 },
    }),

    createReservation: validate({
        event_id: { required: true, type: 'number', min: 1 },
        seat_id:  { required: true, type: 'number', min: 1 },
    }),
};

module.exports = schemas;