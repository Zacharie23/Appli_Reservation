const categoryService = require('../services/CategoryService');

async function getCategories(req, res, next) {
    try {
        const categories = await categoryService.listCategories();
        res.json(categories);
    } catch (err) {
        next(err);
    }
}

async function getCategoryById(req, res, next) {
    try {
        const category = await categoryService.getCategory(parseInt(req.params.id));
        res.json(category);
    } catch (err) {
        next(err);
    }
}

module.exports = { getCategories, getCategoryById };
