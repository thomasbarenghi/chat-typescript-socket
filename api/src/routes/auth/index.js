const express = require('express');
const router = express.Router();

const googleRoutes = require('./google');

router.use('/google', googleRoutes);

module.exports = router;