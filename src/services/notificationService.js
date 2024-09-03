const Gateway = require('./gatewayService');
const rateLimitSettings = require('../config/rateLimitSettings.json')

const gateway = new Gateway()
const messagesTtl = {}

/**
 * Send message to the user if the rate limit allows it
 * @param {string} type Type of notification to be sent
 * @param {string} userId The user ID to receive the message
 * @param {string} message The message to be sent
 * @param {boolean} urgent Defines if it's an urgent message that should be delivered even if rate limited
 */
const send = (type, userId, message, urgent) => {
    if(!type || !userId || !message || type == "" || userId == "" || message == ""){
        return {
            status: 400,
            message:"Request body could not be read properly"
        }
    }

    //Check if rate limit applies
    if(!urgent && isRateLimited(type, userId)){
        console.error(`Error 429 - Too Many Requests - User ${userId} has already received too many requests`)
        return {
            status: 429,
            message: `User ${userId} has already received too many requests`
        }
    }

    try {
        gateway.send(userId, message); 
    } catch (error) {
        return {
            status: 500,
            message: error.message
        }
    }

    if(rateLimitSettings[type]){
        const cacheKey = userId+type

        //Calculates the Time To Live of the message for the rate limit rules of the given type
        const ttl = (new Date()).getTime() + getLimitTimeInMs(type) 

        //Either creates the register on the messagesTtl record or push it to the end of the existing one
        messagesTtl[cacheKey] ? messagesTtl[cacheKey].push(ttl) : messagesTtl[cacheKey] = [ttl]
    }

    return {
        status: 200,
        message: "Notification sent"
    }
}

/**
 * Checks if the request is blocked by the rate limit or not
 * @param {string} type Type of notification to be sent
 * @param {string} userId The user ID to receive the message
 * @returns {boolean} Returns true if the message can't be sent
 */
const isRateLimited = (type, userId) => {
    const cacheKey = userId+type

    //If given registry is undefined, then no messages where sent on the limit period according the rate limit rules
    if(!messagesTtl[cacheKey]) return false
    
    //Loops through the registry and remove the expired messages that are not relevant to the rate limit rules anymore
    for(var ttl of messagesTtl[cacheKey]){
        if(ttl > (new Date()).getTime()) break;
        messagesTtl[cacheKey].shift()
    }

    //If there's less messages to expire than the limit, than this type of message is not yet rate limited for this user
    if(!rateLimitSettings[type] || messagesTtl[cacheKey].length < rateLimitSettings[type]["limit"]) return false
    return true
}

/**
 * Calculate the period in milliseconds
 * @param {string} type Type of notification to be sent
 * @returns {number} Period in milliseconds 
 */
const getLimitTimeInMs = (type) => {
    const period = rateLimitSettings[type]["period"]
    var periodMultiplier = 0

    switch(period){
        case "second":
            periodMultiplier = 1000
            break;
        case "minute":
            periodMultiplier = 60000
            break;
        case "hour":
            periodMultiplier = 3600000
            break;
        case "day":
            periodMultiplier = 86400000
            break;
    }

    return periodMultiplier
}

module.exports = {send};