const subjectQueries = `
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "Fundamentals of Computer Programming", "CS-110","BACHELOR OF SOFTWARE ENGINEERING ");
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "English", "HU-100","BACHELOR OF SOFTWARE ENGINEERING ");
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "Pakistan Studies", "HU-107","BACHELOR OF SOFTWARE ENGINEERING ");
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "Calculus & Analytical Geometry", "MATH-101","BACHELOR OF SOFTWARE ENGINEERING ");
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "Discrete Mathematics", "MATH-161","BACHELOR OF SOFTWARE ENGINEERING ");
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "Applied Physics", "PHY-102","BACHELOR OF SOFTWARE ENGINEERING ");
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "Occupational Health and Safety", "OHS-101","BACHELOR OF SOFTWARE ENGINEERING ");
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "Islamic Studies", "HU-101","BACHELOR OF SOFTWARE ENGINEERING ");
INSERT IGNORE INTO subjects (suid, name, code, degree) VALUES (UUID_TO_BIN(UUID()), "Communication Skills", "HU-109","BACHELOR OF SOFTWARE ENGINEERING ");






`

module.exports = subjectQueries