const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')
const validator = require('validator')



router.get('/', auth, async (req, res) => {
    //get all subjects
    try {
        const getSubjectsQuery = `
            SELECT BIN_TO_UUID(suid) as suid, name, code, degree FROM subjects
        `
        db.query(getSubjectsQuery, (err, results) => {
            if (err) {
                console.error('Error getting subjects:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting subjects', err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No subjects found' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting subjects' })
    }
})

router.get('/:suid', auth, async (req, res) => {
    //get subject of a specific id
    try {
        const { suid } = req.params;
        if (!validator.isUUID(suid)) {
            return res.status(404).json({ message: 'Unauthorized: Subject ID is incorrect.' });
        }
        const getSubjectQuery = `
            SELECT BIN_TO_UUID(suid) as suid, name, code, degree FROM subjects WHERE suid = UUID_TO_BIN(?)
        `
        db.query(getSubjectQuery, [suid], (err, results) => {
            if (err) {
                console.error('Error getting subject:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting subject', err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No subject found for this id' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting subject' })
    }
})

router.get('/degrees', auth, async (req, res) => {
    //get all degrees available
    try {
        const getDegreeQuery = `
            SELECT degree FROM subjects
        `
        db.query(getDegreeQuery, [degree], (err, results) => {
            if (err) {
                console.error('Error getting degree:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting degree', err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No degrees available' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting degree' })
    }
})

router.get('/courses/:degree', auth, async (req, res) => {
    //get all courses of a specific degree
    try {
        const { degree } = req.params;
        const getCourseQuery = `
            SELECT name, code FROM subjects WHERE degree = ?
        `
        db.query(getCourseQuery, [degree], (err, results) => {
            if (err) {
                console.error('Error getting course:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting course', err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No courses found for this degree' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting course' })
    }

})


router.get('/search/:course', auth, async (req, res) => {
    //search for a course
    try {
        const { course } = req.params;
        const getCourseQuery = `
            SELECT BIN_TO_UUID(suid) as suid, name, code, degree FROM subjects WHERE name LIKE ? or code LIKE ? or degree LIKE ?
        `
        db.query(getCourseQuery, [`%${course}%`, `%${course}%`, `%${course}%`], (err, results) => {
            if (err) {
                console.error('Error getting course:', err);
                return res.status(500).json({ error: 'Internal Server Error when getting course', err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No courses found for this search' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting course' })
    }

})

module.exports = router;