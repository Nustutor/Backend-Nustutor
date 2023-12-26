const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')

router.get('/', auth, async (req, res) => {
    try {
        const { uuid } = req.headers;
        const getUserQuery =
            ` SELECT
        UUID_TO_BIN(uuid) AS uuid,
        fullname,
        semester,
        degree,
        dept,
        email,
        password_hash,
        verifiedEmail,
        emailVerificationCode,
        bio
    FROM
        users;`
        db.query(getUserQuery, [uuid], (err, results) => {
            if (err) {
                console.error('Error getting tutor:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting tutor' + err });
            }
            res.status(200).json({ results })
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting tutor' + error })
    }
});





module.exports = router;