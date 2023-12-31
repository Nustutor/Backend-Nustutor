
const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')
const validator = require('validator')


//get class by CUID
router.get('/getclass/:cuid', auth, async (req, res) => {
    try {
        const { cuid } = req.params;
        if (!validator.isUUID(cuid)) {
            return res.status(404).json({ message: 'Unauthorized: Class ID does not exist.' });
        }
        const getClassQuery = `
            SELECT BIN_TO_UUID(cuid) as cuid, BIN_TO_UUID(tuid) as tuid, BIN_TO_UUID(suid) as suid, title, description, rate, multipleStudents 
            FROM classOffered
            WHERE cuid = UUID_TO_BIN(?)
        `
        db.query(getClassQuery, [cuid], (err, results) => {
            if (err) {
                console.error('Error getting class:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting class' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No class found' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting class' } + error)
    }
})

// get schedule of a class
router.get('/schedule/:cuid', auth, async (req, res) => {
    try {
        const { cuid } = req.params;
        if (!validator.isUUID(cuid)) {
            return res.status(404).json({ message: 'Unauthorized: Class ID does not exist.' });
        }
        const getClassScheduleQuery = `
            SELECT startTime
            FROM classOfferedTimeSlots
            WHERE cuid = UUID_TO_BIN(?)
        `
        db.query(getClassScheduleQuery, [cuid], (err, results) => {
            if (err) {
                console.error('Error getting class schedule:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting class schedule' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No class schedule found' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting class schedule' } + error)
    }
})

router.get('/subjectclasses/:suid', auth, async (req, res) => {
    //get all classes of a subject
    try {
        const { suid } = req.params;
        if (!validator.isUUID(suid) || !validator.isUUID(req.headers.uuid)) {
            return res.status(404).json({ message: 'Unauthorized: Subject ID/User UUID is incorrect.' });
        }
        const getSubjectClassesQuery = `
            SELECT BIN_TO_UUID(cuid) as cuid, BIN_TO_UUID(tuid) as tuid, BIN_TO_UUID(suid) as suid, title, description, rate, multipleStudents 
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
        res.status(500).json({ error: 'Internal Server Error when getting classes' } + error)
    }
})

//get all classes by subject name

router.get('/subjectclassesbyname/', auth, async (req, res) => {
    //get all classes of a subject
    try {
        const { name } = req.headers;
        if (!validator.isUUID(req.headers.uuid)) {
            return res.status(404).json({ message: 'Unauthorized: User UUID is incorrect.' });
        }
        const getSubjectClassesQuery = `
            SELECT BIN_TO_UUID(cuid) as cuid, BIN_TO_UUID(tuid) as tuid, BIN_TO_UUID(suid) as suid, title, description, rate, multipleStudents 
            FROM classOffered
            WHERE suid = (SELECT suid FROM subjects WHERE name = ?)
        `
        db.query(getSubjectClassesQuery, [name], (err, results) => {
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
        res.status(500).json({ error: 'Internal Server Error when getting classes' } + error)
    }
})

//get all classes of a user FROM HIS CLASS SCHEDULE
router.get('/userclasses', auth, async (req, res) => {
    try {
        const { uuid } = req.headers;
        if (!validator.isUUID(uuid)) {
            return res.status(404).json({ message: 'Unauthorized: User UUID is incorrect.' });
        }
        const getUserClassesQuery = `
            SELECT BIN_TO_UUID(cuid) as cuid, BIN_TO_UUID(tuid) as tuid, BIN_TO_UUID(suid) as suid, title, description, rate, multipleStudents
            FROM classOffered
            WHERE BIN_TO_UUID(CUID) in (SELECT cuid FROM classSchedule WHERE uuid = UUID_TO_BIN(?))
        `
        db.query(getUserClassesQuery, [uuid], (err, results) => {
            if (err) {
                console.error('Error getting classes:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting classes' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No classes found for this user' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting classes' } + error)
    }
})


router.post('/addclass/:tuid', auth, async (req, res) => {
    // let tutor add a class to their profile
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
        res.status(500).json({ error: 'Internal Server Error when adding class' } + error)
    }
})

// get all classes by a tutor
router.get('/tutorclasses/:tuid', auth, async (req, res) => {
    try {
        const { tuid } = req.params;
        if (!validator.isUUID(tuid) || !validator.isUUID(req.headers.uuid)) {
            return res.status(404).json({ message: 'Unauthorized: Tutor ID/User UUID is incorrect.' });
        }
        const getTutorClassesQuery = `
            SELECT BIN_TO_UUID(cuid) as cuid, BIN_TO_UUID(tuid) as tuid, BIN_TO_UUID(suid) as suid, title, description, rate, multipleStudents 
            FROM classOffered
            WHERE tuid = UUID_TO_BIN(?)
        `
        db.query(getTutorClassesQuery, [tuid], (err, results) => {
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
        res.status(500).json({ error: 'Internal Server Error when getting classes' } + error)
    }
})


// add a class schedule (I.E USER CREATING A CLASS WITH A TUTOR)
router.post('/addclassschedule/:cuid', auth, async (req, res) => {
    try {
        const { cuid } = req.params;
        const { uuid } = req.headers;
        const { startTime } = req.body;
        if (!validator.isUUID(cuid) || !validator.isUUID(uuid)) {
            return res.status(404).json({ message: 'Unauthorized: Class ID/User UUID is incorrect.' });
        }
        // Check if the decoded user ID matches the requested ID
        const fetchUUIDquery = 'SELECT BIN_TO_UUID(uuid) as uuid FROM tutors WHERE tuid = UUID_TO_BIN(?)'
        db.query(fetchUUIDquery, [cuid], (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Internal Server Error when fetching uuid from tuid' + err });
            }
            if (results[0].uuid !== req.user.userId) {
                return res.status(403).json({ message: 'Unauthorized: Token does not match user ID' });
            }
            else {
                // fetch the tuid from the cuid

                const fetchTuidQuery = 'SELECT BIN_TO_UUID(tuid) as tuid FROM classOffered WHERE cuid = UUID_TO_BIN(?)'

                db.query(fetchTuidQuery, [cuid], (err, results) => {
                    if (err) {
                        return res.status(500).json({ error: 'Internal Server Error when fetching tuid from cuid' + err });
                    }
                    const tuid = results[0].tuid;
                    c//onsole.log(tuid)
                    // add the class schedule to class schedule table
                    const addClassScheduleQuery = `
                    INSERT INTO classSchedule (tuid, cuid, uuid, startTime)
                    VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), UUID_TO_BIN(?), ?)
                `
                    db.query(addClassScheduleQuery, [tuid, cuid, uuid, startTime], (err, results) => {
                        if (err) {
                            console.error('Error adding class schedule:' + err);
                            return res.status(500).json({ error: 'Internal Server Error when adding class schedule' + err });
                        }
                        if (results.affectedRows === 0) {
                            return res.status(404).json({ message: 'No class schedule added' });
                        } else {
                            return res.status(200).json({ message: 'Class schedule added successfully' })
                        }
                    })


                })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when adding class schedule' } + error)
    }
})

module.exports = router;