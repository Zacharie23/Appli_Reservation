function validate(schema) {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];

            // Champ requis
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`Le champ "${field}" est requis`);
                continue; // Inutile de vérifier les autres règles si le champ est absent
            }

            // Si le champ est optionnel et absent, on passe
            if (value === undefined || value === null) continue;

            // Type
            if (rules.type && typeof value !== rules.type) {
                errors.push(`Le champ "${field}" doit être de type ${rules.type}`);
            }

            // Valeur minimale (nombre)
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`Le champ "${field}" doit être supérieur ou égal à ${rules.min}`);
            }

            // Longueur minimale (string)
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`Le champ "${field}" doit contenir au moins ${rules.minLength} caractères`);
            }

            // Longueur maximale (string)
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`Le champ "${field}" ne doit pas dépasser ${rules.maxLength} caractères`);
            }

            // Valeurs autorisées (enum)
            if (rules.enum && !rules.enum.includes(value)) {
                errors.push(`Le champ "${field}" doit être l'une des valeurs suivantes : ${rules.enum.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        next();
    };
}

module.exports = validate;
