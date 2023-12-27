const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')

router.get('/', auth, async (req, res) => {
    try {
        const { uuid } = req.headers;
        const getUserQuery =
            ` SELECT
        BIN_TO_UUID(uuid) AS uuid,
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
        users
    WHERE
        uuid = UUID_TO_BIN(?)
        ;`

        db.query(getUserQuery, [uuid], (err, results) => {
            if (err) {
                console.error('Error getting user:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting user' + err });
            }
            res.status(200).json({ results })
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting user' + error })
    }
});





module.exports = router;