const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database/mysql');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const getVerificationEmailString = require('../utils/verificationEmail');
const jwt = require('jsonwebtoken')
const auth = require('../middleware/jwtMiddleware')


require('dotenv').config();


router.post('/signUp', auth, async (req, res) => {

    const createTutorAccountQuery = `INSERT INTO tutors (tuid, uuid) 
    VALUES (UUID_TO_BIN(UUID()), ?)`;

})

module.exports = router;