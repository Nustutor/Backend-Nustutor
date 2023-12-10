const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')
const validator = require('validator')


require('dotenv').config();




router.get('/gettutor/:tuid', auth, async (req, res) => {
    try {
        const { uuid } = req.headers;
        if (!validator.isUUID(uuid)) {
            return res.status(404).json({ message: 'Unauthorized: User ID is incorrect.' });
        }
        const getUserQuery = `
            SELECT DISTINCT users.fullname, users.semester, users.degree, users.dept, users.bio, users.email, BIN_TO_UUID(tutors.tuid) as tuid
            FROM users, tutors, tutorLinks
            WHERE tutors.uuid = UUID_TO_BIN(?) AND users.uuid = UUID_TO_BIN(?)
        `
        db.query(getUserQuery, [uuid, uuid], (err, results) => {
            if (err) {
                console.error('Error getting tutor:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting tutor', err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No tutor found for this user id' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting tutor' })
    }
})

router.get('/gettutorlinks/:tuid', auth, async (req, res) => {
    try {
        const { tuid } = req.params;
        if (!validator.isUUID(tuid)) {
            return res.status(404).json({ message: 'Unauthorized: User ID is incorrect.' });
        }
        const getLinksQuery = `
        SELECT BIN_TO_UUID(luid) as luid, BIN_TO_UUID(tuid) as tuid, link, platform FROM tutorLinks WHERE tuid = UUID_TO_BIN(?)
    `
        db.query(getLinksQuery, [tuid], (err, results) => {
            if (err) {
                console.error('Error getting tutor links:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting tutor links', err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No links found for this tutor' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting tutor links', error })

    }
})


//SIGN UP AS A TUTOR
router.post('/signup/', auth, async (req, res) => {
    try {
        const createTutorAccountQuery = `INSERT INTO tutors (tuid, uuid) 
                                        VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(?))`;
        const { uuid } = req.headers;
        if (!validator.isUUID(uuid)) {
            return res.status(404).json({ message: 'Unauthorized: User ID does not exist.' });
        }
        if (uuid !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized: Token does not match user ID' });
        }
        db.query(createTutorAccountQuery, [uuid], (err, results) => {
            if (err) {
                console.error('Error creating tutor account:', err);
                return res.status(500).json({ error: 'Internal Server Error when creating tutor account', err });
            }
            return res.status(201).json({ message: 'Tutor account created successfully' })
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when creating tutor account' })
    }
})

// LETS THE TUTOR ADD SOCIAL LINKS TO THEIR ACCOUNTS
router.post('/addLinks', auth, async (req, res) => {
    try {
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