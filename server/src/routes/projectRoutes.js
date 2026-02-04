const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All project routes require authentication
router.use(authenticateToken);

router.get('/', projectController.getProjects);
router.post('/', authorizeRole(['Admin']), projectController.createProject);
router.delete('/:id', authorizeRole(['Admin']), projectController.deleteProject);

module.exports = router;
