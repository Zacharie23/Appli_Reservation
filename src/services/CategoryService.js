const Category = require('../models/CategoryModel');

async function listCategories() {
    return await Category.getAll();
}

async function getCategory(id) {
    const category = await Category.getById(id);
    if (!category) throw { status: 404, message: 'Catégorie non trouvée' };
    return category;
}

module.exports = { listCategories, getCategory };
