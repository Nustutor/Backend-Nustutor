const express = require('express');
const cors = require('cors')
const app = express();
const port = 4306;


var corsOptions = {
    origin: 'https://nustutor.mooo.com',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']

}

app.use(cors(corsOptions))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }))

const userRoute = require('./routes/user');
const signUpRoute = require('./routes/signup');
const loginRoute = require('./routes/login');
const tutorRoute = require('./routes/tutor')
const subjectRoute = require('./routes/subject')
const classRoute = require('./routes/class')


app.use("/api/v1/user", userRoute);
app.use("/api/v1/signup", signUpRoute);
app.use("/api/v1/login", loginRoute);
app.use("/api/v1/tutor", tutorRoute);
app.use("/api/v1/subject", subjectRoute);
app.use("/api/v1/class", classRoute);


app.get("/api/v1/test", (req, res) => {
    res.json({ message: "Express application for Nustutor running (test)!" });
})

app.listen(port, () => {
    console.log("Express Application for Nustutor running on port " + port);
})