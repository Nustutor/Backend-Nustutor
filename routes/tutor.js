const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')
const validator = require('validator')


router.get('/getofferedclasses/:tuid', auth, async (req, res) => {
    //get all classes offered
    try {
        const { tuid } = req.params;
        const { uuid } = req.headers;
        if (!validator.isUUID(uuid) || !validator.isUUID(tuid)) {
            return res.status(404).json({ message: 'Unauthorized: User ID/Tutor ID is incorrect.' });
        }
        const getClassesQuery = `
            SELECT BIN_TO_UUID(cuid) as cuid, BIN_TO_UUID(tuid) as tuid, BIN_TO_UUID(suid) as suid, title, description, rate, multipleStudents FROM classOffered
            WHERE  tuid = UUID_TO_BIN(?)
        `
        db.query(getClassesQuery, [tuid], (err, results) => {
            if (err) {
                console.error('Error getting classes:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting classes' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No classes found for this tutor' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting classes ' + error })
    }
})

router.get('/tutorview/gettutor/', auth, async (req, res) => {
    //get the account of tutor from the tutor view
    try {
        const { uuid } = req.headers;
        if (!validator.isUUID(uuid)) {
            return res.status(404).json({ message: 'Unauthorized: User ID is incorrect.' });
        }
        if (uuid !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized: Token does not match user ID' });
        }
        const getTutorAccountQuery = `
            SELECT BIN_TO_UUID(tuid) as tuid, BIN_TO_UUID(users.uuid) as uuid, users.fullname, users.semester, users.degree, users.dept, users.bio, users.email FROM tutors, users
            WHERE users.uuid = UUID_TO_BIN(?)
        `
        db.query(getTutorAccountQuery, [uuid], (err, results) => {
            if (err) {
                console.error('Error getting tutor account:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting tutor account' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No tutor account found for this user id' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting tutor account' + error })
    }
})

router.get('/gettutor/:tuid', auth, async (req, res) => {
    try {
        const { tuid } = req.params;
        if (!validator.isUUID(tuid)) {
            return res.status(404).json({ message: 'Unauthorized: Tutor ID is incorrect.' });
        }
        const getTutorData = `
        SELECT BIN_TO_UUID(u.uuid) AS user_uuid, u.fullname, u.semester, u.degree, u.dept, u.email, u.verifiedEmail, u.emailVerificationCode, u.bio, tl.link, tl.platform
    FROM users u
    JOIN tutors t ON u.uuid = t.uuid
    LEFT JOIN tutorLinks tl ON t.tuid = tl.tuid
    WHERE t.tuid = UUID_TO_BIN(?);
        `
        db.query(getTutorData, [tuid], (err, results) => {
            if (err) {

                console.error('Error getting tutor:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting tutor' + err });
            }
            console.log(tuid)
            if (results.length === 0) {
                return res.status(404).json({ message: 'No tutor found for this tutor id' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting tutor' + error })
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
                console.error('Error getting tutor links:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting tutor links' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No links found for this tutor' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting tutor links' + error })

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
                console.error('Error creating tutor account:' + err);
                return res.status(500).json({ error: 'Internal Server Error when creating tutor account' + err });
            }
            return res.status(201).json({ message: 'Tutor account created successfully' })
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when creating tutor account' })
    }
})

// LETS THE TUTOR ADD SOCIAL LINKS TO THEIR ACCOUNTS
router.post('/addsociallink', auth, async (req, res) => {
    try {

        const { uuid } = req.headers;
        const { tuid, link, platform } = req.body;
        if (!validator.isUUID(tuid)) {
            return res.status(404).json({ message: 'Unauthorized: Tutor ID does not exist.' });
        }
        if (uuid !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized: Token does not match user ID' });
        }

        const addLinksQuery = `INSERT INTO tutorLinks (luid, tuid, link, platform)
            VALUES (UUID_TO_BIN(UUID()), UUID_TO_BIN(?), ?, ?)`;
        db.query(addLinksQuery, [tuid, link, platform], (err, results) => {
            if (err) {
                console.error('Error adding links:' + err);
                return res.status(500).json({ error: 'Internal Server Error when adding links' + err });
            }
            console.log("Link added")
            return res.status(201).json({ "Link added:": results })
        })
    }




    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when adding links ' + error })
    }

})




module.exports = router;