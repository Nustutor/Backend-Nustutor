
const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')
const validator = require('validator')

router.get('/subjectclasses/:suid', auth, async (req, res) => {
    //get all classes of a subject
    try {
        const { suid } = req.params;
        if (!validator.isUUID(suid) || !validator.isUUID(req.headers.uuid)) {
            return res.status(404).json({ message: 'Unauthorized: Subject ID/User UUID is incorrect.' });
        }
        const getSubjectClassesQuery = `
            SELECT BIN_TO_UUID(cuid) as cuid, BIN_TO_UUID(tuid) as tuid, BIN_TO_UUID(suid) as suid, title, description, rate, multipleStudents, availableTimeslots 
            FROM classOffered
            WHERE suid = UUID_TO_BIN(?)
        `
        db.query(getSubjectClassesQuery, [suid], (err, results) => {
            if (err) {
                console.error('Error getting classes:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting classes' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No classes found for this subject' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting classes' })
    }
})


router.post('/addclass/:tuid', auth, async (req, res) => {
    try {
        const { tuid } = req.params;
        const { suid, title, description, rate, multipleStudents, availableTimeslots } = req.body;
        if (!validator.isUUID(tuid) || !validator.isUUID(suid)) {
            return res.status(404).json({ message: 'Unauthorized: User / Subject ID does not exist.' });
        }
        // Check if the decoded user ID matches the requested ID
        const fetchUUIDquery = 'SELECT BIN_TO_UUID(uuid) as uuid FROM tutors WHERE tuid = UUID_TO_BIN(?)'
        db.query(fetchUUIDquery, [tuid], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Internal Server Error when fetching uuid from tuid' + err });
            }
            if (results[0].uuid !== req.user.userId) {
                return res.status(403).json({ message: 'Unauthorized: Token does not match user ID' });
            }
            else {
                // available time slots is a list of integers
                // add the class to class table and the class time slot to class time slot table
                const addClassQuery = `
                    INSERT INTO classOffered (tuid, suid, title, description, rate, multipleStudents, cuid)
                    VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?, ?, ?, UUID_TO_BIN(UUID()))
                `
                const addClassTimeSlotsQuery = ` INSERT INTO classOfferedTimeSlots (cuid, startTime) VALUES ?`

                db.query(addClassQuery, [tuid, suid, title, description, rate, multipleStudents], (err, results) => {
                    if (err) {
                        console.error('Error adding class:' + err);
                        return res.status(500).json({ error: 'Internal Server Error when adding class' + err });
                    }
                    if (results.affectedRows === 0) {
                        return res.status(404).json({ message: 'No class added' });
                    } else {
                        const cuid = results.insertId;
                        console.log(cuid)
                        const values = availableTimeslots.map((time) => [cuid, time])
                        db.query(addClassTimeSlotsQuery, [values], (err, results) => {
                            if (err) {
                                console.error('Error adding class time slots:' + err);
                                return res.status(500).json({ error: 'Internal Server Error when adding class time slots' + err });
                            }
                            if (results.affectedRows === 0) {
                                return res.status(404).json({ message: 'No class time slots added' });
                            } else {
                                return res.status(200).json({ message: 'Class added successfully' })
                            }
                        })
                    }
                })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when adding class' })
    }
})

module.exports = router;