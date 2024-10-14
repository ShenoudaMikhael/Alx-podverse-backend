const dbClient = require('../utils/db');
const Category = dbClient.models.categories;

class CategoryController {

    static async createCategory(req, res) {
        try {
            const { name } = req.body;
    
            // Validate input
            if (!name) {
                return res.status(400).json({ message: 'Category name is required' });
            }
    
            // Check if category already exists
            const existingCategory = await Category.findOne({ where: { name } });
            if (existingCategory) {
                return res.status(400).json({ message: 'Category already exists' });
            }
    
            // Create new category
            const newCategory = await Category.create({ name });
    
            return res.status(201).json({
                message: 'Category created successfully!',
                category: newCategory,
            });
        } catch (error) {
            console.error('Error creating category:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }

    static async getCategory(req, res) {
        try {
            const categories = await Category.findAll({
                attributes: ['id', 'name']
            });
        
            res.json(categories);
          } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ error: 'An error occurred while fetching categories' });
          }
    }
}

module.exports = CategoryController;