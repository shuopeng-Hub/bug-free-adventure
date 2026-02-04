const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Admin only routes
router.use(authenticateToken);
router.use(authorizeRole(['Admin']));

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.patch('/:id/approve', userController.updateUserStatus);
router.post('/:id/role', userController.assignRole);

module.exports = router;
