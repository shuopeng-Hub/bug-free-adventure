const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, checkPermission } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Public-ish (authenticated users need to load their menus)
// We might want to filter this based on user permissions in the future
router.get('/tree', menuController.getMenus);
router.get('/', menuController.getAllMenusFlat);

// Admin only
router.post('/', checkPermission('system:admin'), menuController.createMenu);
router.patch('/:id', checkPermission('system:admin'), menuController.updateMenu);
router.delete('/:id', checkPermission('system:admin'), menuController.deleteMenu);

module.exports = router;
