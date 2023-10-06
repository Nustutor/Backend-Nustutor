const express = require('express');
const app = express();
const port = 4306;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }))

const userRoute = require('./routes/user');


app.use("/api/v1/user", userRoute);


app.get("/api/v1/test", (req, res) => {
    res.send.json({ message: "Express application for Nustutor running!" });
})

app.listen(port, () => {
    console.log("Express Application for Nustutor running on port " + port);
})