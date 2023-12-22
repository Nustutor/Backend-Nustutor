const mysql = require('mysql2')
require('dotenv').config();

const createTriggersQuery = require('./triggers');
const createUserTable = require('./tables')
const createSubjectsQuery = require('./subject_dump')

// TODO: FOR PRODUCTION
// https://stackoverflow.com/questions/56389698/why-super-privileges-are-disabled-when-binary-logging-option-is-on
// Cannot enable triggers without super perms/binary logging, follow the above guide
// TODO: END

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
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
})

// function to keep the connection alive
function pingdb() {
    var sql_keep = `SELECT 1 + 1 AS solution`;
    con.query(sql_keep, function (err, result) {
        if (err) throw err;
        console.log("Ping DB");
    });
}
setInterval(pingdb, 40000);


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:' + err);
        return;
    }
    console.log('Connected to MySQL');
});


createTablesAndTriggers();

function createTablesAndTriggers() {

    connection.query(createUserTable, (err) => {
        if (err) {
            console.error('Error creating tables:' + err);
        } else {
            console.log('Tables created or already exists.');
        }
    });

    connection.query(createTriggersQuery, (err) => {
        if (err) {
            console.error('Error creating triggers:' + err);
        } else {
            console.log('Triggers created or already exists.');
        }
    })

    connection.query(createSubjectsQuery, (err) => {
        if (err) {
            console.error('Error creating subjects:' + err);
        } else {
            console.log('Subjects created or already exists.');
        }
    })
}

module.exports = connection;