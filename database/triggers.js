const createTriggersQuery = `
    CREATE TRIGGER IF NOT EXISTS insert_check_email_username_exists
        BEFORE INSERT ON users
        FOR EACH ROW
        BEGIN
            IF (SELECT COUNT(*) FROM users WHERE email = NEW.email) > 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email or username already exists';
            END IF;
        END;

    CREATE TRIGGER IF NOT EXISTS update_check_email_username_exists
        BEFORE UPDATE ON users
        FOR EACH ROW
        BEGIN
        IF NEW.verifiedEmail IS NULL THEN
            IF (SELECT COUNT(*) FROM users WHERE email = NEW.email) > 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email or username already exists';
            END IF;
            END IF;
        END;

        CREATE TRIGGER IF NOT EXISTS insert_check_uuid_exists
        BEFORE INSERT ON tutors
        FOR EACH ROW
        BEGIN
            IF (SELECT COUNT(*) FROM tutors WHERE uuid = NEW.uuid) > 0 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'UUID already exists';
            END IF;
        END;
    `

module.exports = createTriggersQuery;

