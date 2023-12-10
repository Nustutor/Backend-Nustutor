const subjectQueries = `
  INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), 'Fundamentals of Computer Programming', 'CS-110', 'SOFTWARE ENGINEERING');
    INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), 'English', 'HU-100', 'SOFTWARE ENGINEERING');


`

module.exports = subjectQueries