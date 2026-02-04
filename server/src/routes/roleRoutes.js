const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken, checkPermission } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.post('/', checkPermission('system:admin'), roleController.createRole);
router.get('/', roleController.getRoles);
router.get('/permissions', roleController.getAllPermissions);
router.patch('/:id/permissions', checkPermission('system:admin'), roleController.updateRole);
router.patch('/:id/menus', checkPermission('system:admin'), roleController.updateRoleMenus);

module.exports = router;
