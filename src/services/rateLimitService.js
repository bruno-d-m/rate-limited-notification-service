const rateLimitSettings = require('../config/rateLimitSettings.json')

const errorMessages = {
    400: "Request body could not be read properly",
    404: "Not found", 
    409: "Rules for the given type are already set"
}

const acceptedPeriods = ['second', 'minute', 'hour', 'day']

const getAll = () => {
    return {
        status: 200,
        message: rateLimitSettings
    };
}

const getOne = (type) => {
    if(rateLimitSettings[type]){
        return {
            status: 200,
            message: rateLimitSettings[type]
        };
    }

    return {
        status: 404,
        message: errorMessages[404]
    }

}

const create = (type, limit, period) => {
    if(!limit || !period || limit == "" || limit < 1 || period == "" || !acceptedPeriods.includes(period)){
        return {
            status: 400,
            message: errorMessages[400]
        }
    }

    if(rateLimitSettings[type]){
        return {
            status: 409,
            message: errorMessages[409]
        };
    }

    rateLimitSettings[type] = {limit, period}
    return {
        status: 201,
        message: rateLimitSettings[type]
    };
}

const update = (type, limit, period) => {
    if(!limit || !period || limit == "" || limit < 1 || period == "" || !acceptedPeriods.includes(period)){
        return {
            status: 400,
            message: errorMessages[400]
        }
    }

    if(!rateLimitSettings[type]){
        return create(type, limit, period)
    }
    
    rateLimitSettings[type] = {limit, period}
    return {
        status: 200,
        message: rateLimitSettings[type]
    };
}

const deleteAll = () => {
    for(const [key] of Object.entries(rateLimitSettings)){
        delete rateLimitSettings[key]
    }

    return{
        status: 200,
        message: "All rate limit rules were deleted"
    }
}

const deleteOne = (type) => {
    if(!rateLimitSettings[type]){
        return{
            status: 404,
            message: errorMessages[404]
        }
    }
    delete rateLimitSettings[type]
    return{
        status: 200,
        message: `${type} rate limit rule deleted`
    }
}

module.exports = {
    getAll, 
    getOne, 
    create, 
    update, 
    deleteAll, 
    deleteOne
};