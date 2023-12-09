// We use use binary(16) for uuid because it is more efficient than varchar(36)
// see : https://www.javatpoint.com/mysql-uuid


// refer to : https://dbdiagram.io/d/651ff6c4ffbf5169f02d45f3
const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
    uuid BINARY(16) PRIMARY KEY,
    fullname VARCHAR(255),
    semester INT,
    degree VARCHAR(255),
    dept VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    verifiedEmail bool,
    emailVerificationCode VARCHAR(255),
    bio TEXT
);

CREATE TABLE IF NOT EXISTS tutors (
    tuid BINARY(16) PRIMARY KEY,
    uuid BINARY(16) REFERENCES users(uuid)
);

CREATE TABLE IF NOT EXISTS tutorReviews (
    ruid BINARY(16) PRIMARY KEY,
    tuid BINARY(16) REFERENCES tutors(tuid),
    review TEXT,
    rating INT
);

CREATE TABLE IF NOT EXISTS tutorLinks (
    luid BINARY(16) PRIMARY KEY,
    tuid BINARY(16) REFERENCES tutors(tuid),
    link TEXT,
    platform TEXT
);

CREATE TABLE IF NOT EXISTS subjects (
    suid BINARY(16) PRIMARY KEY,
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS classOffered (
    tuid BINARY(16) REFERENCES tutors(tuid),
    cuid BINARY(16) PRIMARY KEY,
    suid BINARY(16) REFERENCES subjects(suid),
    title VARCHAR(255),
    description TEXT,
    rate INT,
    multipleStudents BOOLEAN,
    availableTimeslots TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classSchedule (
    tuid BINARY(16) REFERENCES tutors(tuid),
    cuid BINARY(16) REFERENCES classOffered(cuid),
    uuid BINARY(16) REFERENCES users(uuid),
    timeslot TIMESTAMP
);
`;

module.exports = createUserTable