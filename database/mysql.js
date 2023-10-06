const mysql = require('mysql2')
require('dotenv').config();

// for production environment, the env file will contain the database credentaials for RDS.
// for development, the env file will contain the database credentials for local database.
// for development, copy paste the content of ".env.example" to ".env".
// Production env will be automatically setup via the CI/CD pipeline.
// For dev, will need to create a user manually.
// Follow: https://www.digitalocean.com/community/tutorials/how-to-create-a-new-user-and-grant-permissions-in-mysql

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
})


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');

    // Check if tables exist and create them if they don't
    createTables();
});

function createTables() {
    const createUserTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL
        )
    `;

    connection.query(createUserTable, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table created or already exists.');
        }
    });
}

module.exports = connection;