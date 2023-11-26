const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database/mysql');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

router.post('/', async (req, res) => {
    try {
        const { username, email, password, firstname, lastname, semester, degree, dept, bio } = req.body;

        const saltRounds = 12

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const emailVerificationCode = crypto.randomBytes(16).toString('hex');

        // Insert the new user into the 'users' table
        const insertUserQuery = `
            INSERT INTO users (uuid, verifiedEmail,emailVerificationCode, username, email, password_hash, firstname, lastname, semester, degree, dept, bio)
            VALUES (UUID_TO_BIN(UUID()), false ,?,  ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertUserQuery,
            [emailVerificationCode, username, email, hashedPassword, firstname, lastname, semester, degree, dept, bio],
            (err, results) => {
                if (err) {
                    console.error('Error creating user:', err);
                    res.status(500).json({ error: 'Internal Server Error', err });
                } else {
                    console.log('User created successfully');
                    console.log('user data', results)
                    res.status(201).json({ message: 'User created successfully' });
                }
            }
        );


        const verificationLink = "http://localhost:3000/verifyEmail/" + emailVerificationCode + "/" + email;
        const emailHTML = await ejs.renderFile('verificationEmail.ejs', { firstname, verificationLink });


        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const sendVerificationMail = (user) => {
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Email Verification for Nustutor',
                html: emailHTML


            }
        }


    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
