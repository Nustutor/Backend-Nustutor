const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')

router.get('/:uuid', auth, async (req, res) => {
    try {
        const { uuid } = req.params;
        const getUserQuery = `
            SELECT * FROM users WHERE uuid = UUID_TO_BIN(?)
        `
        db.query(getUserQuery, [uuid], (err, results) => {
            if (err) {
                console.error('Error getting tutor:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting tutor' + err });
            }
            res.status(200).json({ results })
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting tutor' })
    }
});





module.exports = router;