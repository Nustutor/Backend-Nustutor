const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../database/mysql');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const getVerificationEmailString = require('../utils/verificationEmail');
const jwt = require('jsonwebtoken')
const auth = require('../middleware/jwtMiddleware')
const validator = require('validator')


require('dotenv').config();


router.get('/gettutor/:uuid', auth, async (req, res) => {
    try {
        const { uuid } = req.params;
        const getUserQuery = `
            SELECT DISTINCT users.firstname, users.lastname, users.semester, users.degree, users.dept, users.bio, users.email, BIN_TO_UUID(tutors.tuid) as tuid
            FROM users, tutors, tutorLinks
            WHERE tutors.uuid = UUID_TO_BIN(?) AND users.uuid = UUID_TO_BIN(?)
        `
        db.query(getUserQuery, [uuid, uuid], (err, results) => {
            if (err) {
                console.error('Error getting tutor:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting tutor', err });
            }
            res.status(200).json({ results })
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting tutor' })
    }
})

// router.get('/getTutorLinks/:tuid', auth, async (req, res) => {
//     const { tuid } = req.params;
//     const getLinksQuery = `
//         SELECT * FROM tutorLinks WHERE tuid = UUID_TO_BIN(?)
//     `
// })


//SIGN UP AS A TUTOR
router.post('/signup/', auth, async (req, res) => {
    try {
        const createTutorAccountQuery = `INSERT INTO tutors (tuid, uuid) 
                                        VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(?))`;
        const { uuid } = req.body;
        console.log(req.body)
        console.log(uuid)
        db.query(createTutorAccountQuery, [uuid], (err, results) => {
            if (err) {
                console.error('Error creating tutor account:', err);
                return res.status(500).json({ error: 'Internal Server Error when creating tutor account', err });
            }
            res.status(201).json({ results })
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when creating tutor account' })
    }
})

// LETS THE TUTOR ADD SOCIAL LINKS TO THEIR ACCOUNTS
router.post('/addLinks', auth, async (req, res) => {
    try {
        let uuidExist = true;
        const { tuid, link, platform } = req.body;
        if (!validator.isUUID(tuid)) {
            return res.status(404).json({ message: 'Unauthorized: User ID does not exist.' });
        }
        // Check if the decoded user ID matches the requested ID
        const fetchUUIDquery = 'SELECT BIN_TO_UUID(uuid) as uuid FROM tutors WHERE tuid = UUID_TO_BIN(?)'
        db.query(fetchUUIDquery, [tuid], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Internal Server Error when fetching uuid from tuid', err });
            }
            if (results[0].uuid !== req.user.userId) {
                uuidExist = false;
                return res.status(403).json({ message: 'Unauthorized: Token does not match user ID' });
            }
            else {
                const addLinksQuery = `INSERT INTO tutorLinks (luid, tuid, link, platform)
            VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?, ?)`;

                db.query(addLinksQuery, [tuid, link, platform], (err, results) => {
                    if (err) {
                        console.error('Error adding links:', err);
                        return res.status(500).json({ error: 'Internal Server Error when adding links', err });
                    }
                    console.log("Link added")
                    return res.status(201).json({ "Link added:": results })
                })
            }
        })


    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when adding links' })
    }

})



module.exports = router;