class Gateway {
    /**
     * Function responsible for sending the message to the user
     * @param {string} userID The user ID to receive the message
     * @param {string} message The message to be sent
     */
    send(userId, message) {
        console.log("sending message to user " + userId + ": " + message);
    }
}

module.exports = Gateway;