const express = require('express');
const emailController = require('../controllers/emailController');

const router = express.Router();

router.post('/email', emailController.postEmail);

module.exports = router;
