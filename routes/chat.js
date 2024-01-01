const express = require("express");
const router = express.Router();
const socketIO = require('socket.io');



// Create a mapping of user UUIDs to their socket connections
const connectedUsers = {};


module.exports = (server) => {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        //Server side code User registration
        socket.on('authenticate', (authToken) => {
            if (!authToken) {
                console.log("No auth token provided.")
                socket.emit("No auth token provided!")
            }
            else {

                //admin.auth().verifyIdToken(authToken).then(() => {
                let userUUID = socket.request._query.user;
                socket.userUUID = userUUID;
                connectedUsers[userUUID] = socket;
                console.log(connectedUsers)
            }
            // }
        });
        //Receive message on server and emit it to private user
        socket.on('private_chat', async function (data) {
            const to_user = data.to_user
            const message = data.message
            const from_user = socket.request._query.user;
            try {
                const messageDoc = {
                    from_user,
                    to_user,
                    message,
                    timestamp: new Date(),
                }
                console.log(messageDoc)
                const result = await messagesCollection.insertOne(messageDoc);
                console.log('Message saved to MongoDB:', message);
            }
            catch (error) {
                console.error('Error saving message to MongoDB:', error);
            }
            if (Object.hasOwn(connectedUsers, to_user)) {
                connectedUsers[to_user].emit('private_chat', {
                    //The sender's username
                    userUUID: socket.userUUID,
                    //Message sent to receiver
                    message: message
                })
            }
            console.log("Message sent from user", from_user, "to user", to_user)
        })
        // Retrieve messages from MongoDB
        socket.on('retrieve_messages', async function (data) {


            const query = {
                $or: [
                    { from_user: socket.userUUID, to_user: data.to_user },
                    { from_user: data.to_user, to_user: socket.userUUID },
                ],
            };
            const messages = await messagesCollection.find(query).toArray();
            socket.emit("messages are as follows:");
            socket.emit("retrieve_messages", messages)
        });



        // Handle user disconnection
        socket.on('disconnect', () => {
            console.log('A user disconnected');
            // Remove the user's socket from the userSockets mapping
            delete connectedUsers[socket.userUUID];
        });
    });
    
};