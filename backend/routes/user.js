const express = require('express');
const router = express.Router();
const { 
    createUser, 
    loginUser, 
    updateCount, 
    getUserById, 
    resetCount 
} = require('../controllers/userController');

// All routes are public - no authentication needed
router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/:userId', getUserById);
router.put('/:userId/count', updateCount);
router.put('/:userId/reset-count', resetCount);

module.exports = router;