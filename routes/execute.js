const express = require('express');

const router = express.Router();

const moonController = require('../controllers/tothemoon');

router.get('/showTokens', moonController.getTokens);

router.post('/getCEX',  moonController.getCEX );

router.post('/getDEX', moonController.getDEX);

router.post('/addTokens', moonController.addTokens);

router.get('/example', moonController.example);

router.get('/getArbitrage', moonController.getArbitrage);

module.exports = router;