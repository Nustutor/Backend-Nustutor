const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const auth = require('../middleware/jwtMiddleware')
const validator = require('validator')



router.get('/', auth, async (req, res) => {
    //get all subjects
    try {
        const getSubjectsQuery = `
            SELECT DISTINCT BIN_TO_UUID(suid) as suid, name, code, degree FROM subjects
        `
        db.query(getSubjectsQuery, (err, results) => {
            if (err) {
                console.error('Error getting subjects:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting subjects' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No subjects found' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting subjects' } + error)
    }
})

// get all distinct subject names
router.get('/subject_names', auth, async (req, res) => {
    //get all subjects
    try {
        const getSubjectsQuery =
            //query to only get distinct names, and the suids of those names
            `
            SELECT DISTINCT name, BIN_TO_UUID(suid) as suid FROM subjects
        `
        db.query(getSubjectsQuery, (err, results) => {
            if (err) {
                console.error('Error getting subjects:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting subjects' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No subjects found' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting subjects' } + error)
    }
})

router.get('/subjectid/:suid', auth, async (req, res) => {
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
                console.error('Error getting subject:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting subject' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No subject found for this id' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting subject' } + error)
    }
})

router.get('/degrees/', async (req, res) => {
    //get all degrees available
    try {
        const getDegreeQuery = `
            SELECT DISTINCT degree FROM subjects
        `
        db.query(getDegreeQuery, [], (err, results) => {
            if (err) {
                console.error('Error getting degree:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting degree' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No degrees available' });
            } else {
                res.status(200).json(results)
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting degree ' + error })
    }
})

router.get('/degree_subjects/', auth, async (req, res) => {
    //get all courses of a specific degree
    try {
        const { degree } = req.headers;

        const getCourseQuery = `
            SELECT DISTINCT name, code FROM subjects WHERE degree = ?
        `
        db.query(getCourseQuery, [degree], (err, results) => {
            if (err) {
                console.error('Error getting course:' + err);
                return res.status(500).json({ error: 'Internal Server Error when getting course' + err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No courses found for this degree' });
            } else {
                res.status(200).json({ results })
            }
        })
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting course' } + error)
    }

})


router.get('/search/', auth, async (req, res) => {
    // Search for a subject
    try {
        const { search_term } = req.body;
        const getCourseQuery = `
        SELECT BIN_TO_UUID(subjects.suid) as suid, subjects.name, subjects.code, subjects.degree 
        FROM subjects
        LEFT JOIN classOffered ON subjects.suid = classOffered.suid        
            WHERE name LIKE ? 
               OR code LIKE ? 
               OR degree LIKE ?
               OR classOffered.title LIKE ?
        ORDER BY subjects.name ASC 
        `;

        // Search by name
        db.query(getCourseQuery, [`%${search_term}%`, '', '', ''], (err, results) => {
            if (err) {
                console.error('Error getting course: ');
                return res.status(500).json({ error: 'Internal Server Error when getting course' + err });
            }

            // If results are found by name, return them
            if (results.length > 0) {
                return res.status(200).json(results);
            }

            // If no results by name, search by class offered title
            db.query(getCourseQuery, ['', '', '', `%${search_term}%`], (err, results) => {
                if (err) {
                    console.error('Error getting course:' + err);
                    return res.status(500).json({ error: 'Internal Server Error when getting course' + err });
                }

                // If results are found by class offered title, return them
                if (results.length > 0) {
                    return res.status(200).json(results);
                }

                // If no results by name or class offered title, search by degree
                db.query(getCourseQuery, ['', '', `%${search_term}%`, ''], (err, results) => {
                    if (err) {
                        console.error('Error getting course:' + err);
                        return res.status(500).json({ error: 'Internal Server Error when getting course' + err });
                    }

                    // If results are found by degree return them
                    if (results.length > 0) {
                        return res.status(200).json(results);
                    }
                    // finally search by code
                    db.query(getCourseQuery, ['', `%${search_term}%`, '', ''], (err, results) => {
                        if (err) {
                            console.error('Error getting course:' + err);
                            return res.status(500).json({ error: 'Internal Server Error when getting course' + err });
                        }

                        // If results are found by code return them
                        if (results.length > 0) {
                            return res.status(200).json(results);
                        }
                        else {
                            return res.status(404).json({ message: 'No courses found for this search term' });
                        }
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error when getting course' + error });
    }
});


module.exports = router;
