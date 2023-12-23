const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database/mysql');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const getVerificationEmailString = require('../utils/verificationEmail');

require('dotenv').config();



// VERIFY SIGNUP
router.get('/verifyEmail/:emailVerificationCode/', async (req, res) => {
    const verificationCode = req.params.emailVerificationCode
    try {
        const verifyEmailQuery = `
        UPDATE users
        SET verifiedEmail = true
        WHERE emailVerificationCode = ?
        `
        db.query(verifyEmailQuery, [verificationCode], (err, results) => {
            if (err) {
                console.error('Error verifying email:' + err);
                res.status(500).json({ error: 'Internal DB Server Error' + err });
            }
            else if (results.affectedRows === 0) {
                console.log('Email verification failed');
                res.status(500).json({ error: 'Email verification failed, no user found.' });
            }
            else {
                console.log('Email verified successfully');
                res.status(201).json({ message: 'Email verified successfully' });

            }
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when verifying email' + err });
    }
})

// ADD USER AND SEND VERIFICATION EMAIL
router.post('/', async (req, res) => {
    try {
        const { email, password, fullname, semester, degree, dept, bio } = req.body;

        const saltRounds = 12

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const emailVerificationCode = crypto.randomBytes(16).toString('hex');

        // Insert the new user into the 'users' table
        const insertUserQuery = `
            INSERT INTO users (uuid, verifiedEmail,emailVerificationCode, email, password_hash, fullname, semester, degree, dept, bio)
            VALUES (UUID_TO_BIN(UUID()), false , ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertUserQuery,
            [emailVerificationCode, email, hashedPassword, fullname, semester, degree, dept, bio],
            (err, results) => {
                if (err) {
                    console.error('Error creating user:' + err);
                    return res.status(500).json({ error: 'Internal Server Error when creating user' + err });
                } else {
                    console.log('User created successfully');
                    console.log('user data', results);
                    const verificationLink = "http://localhost:3000/verifyEmail/" + emailVerificationCode + "/";
                    const emailHTML = getVerificationEmailString(fullname, verificationLink)
                    const transporter = nodemailer.createTransport({
                        service: 'Gmail',
                        auth: {
                            type: 'OAuth2',
                            user: process.env.EMAIL,
                            clientId: process.env.GOOGLE_CLIENT_ID,
                            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,

                        },
                    });


                    // see : https://www.youtube.com/watch?v=-rcRf7yswfM for OAuth2
                    // see : https://stackoverflow.com/questions/48854066/missing-credentials-for-plain-nodemailer
                    const mailOptions = {
                        from: process.env.EMAIL,
                        to: email,
                        subject: 'Email Verification for Nustutor',
                        html: emailHTML
                    }

                    transporter.sendMail(mailOptions, async (mailError, result) => {
                        if (mailError) {
                            // res.status(500).json({ error: 'Internal Server Error when sending verification mail'+ error });
                            console.log("Error when sending verification email", mailError)
                            const deleteUserQuery = `
                            DELETE FROM users WHERE email = ?
                            `

                            db.query(deleteUserQuery, [email])
                            return res.status(500).json({ error: 'Internal Server Error when sending verification mail', mailError });

                        }
                        else {
                            console.log("Verification email sent successfully")
                            return res.status(201).json({ message: 'User created successfully and verification email sent' });
                        }
                    })
                }
            }
        );

    } catch (error) {
        console.error('Error creating user:' + error);
        res.status(500).json({ error: 'Internal Server Error', error });
    }
});



module.exports = router;
