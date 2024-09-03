// API's services
const notificationService = require("./src/services/notificationService")
const rateLimitService = require("./src/services/rateLimitService")

// Express for http routing
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

// Middlewares
app.use(bodyParser.json())
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Endpoints
app.get('/settings/', (req,res) => {
    /*
        #swagger.tags = ['Settings']
        #swagger.summary = 'Returns all rate limit rules'
        #swagger.description = 'Returns all rate limit rules'
    */

    const result = rateLimitService.getAll()
    res.status(result.status).send(result.message)
    /* 
        #swagger.responses[200] = {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/setOfRules"
                    }
                }
            }
        }
    */
})

app.get('/settings/:type', (req,res) => {
    /*
        #swagger.tags = ['Settings']
        #swagger.summary = 'Returns a rate limit rule by its name'
        #swagger.description = 'Returns a rate limit rule by its name'
    */

    const type = req.params.type

    const result = rateLimitService.getOne(type)
    res.status(result.status).send(result.message)
    /* 
        #swagger.responses[200] = {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/setOfRules"
                    }
                }
            }
        }
    */
})

app.post('/settings/:type', (req,res) => {
    /*
        #swagger.tags = ['Settings']
        #swagger.summary = 'Creates a new rate limit rule'
        #swagger.description = 'Creates a new rate limit rule'
    */

    const type = req.params.type
    // const limit = req.body?.limit
    // const period = req.body?.period
    const {limit, period} = req.body
    /* 
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/rule"
                    }
                }
            }
        }
    */

    const result = rateLimitService.create(type, limit, period)
    res.status(result.status).send(result.message)
    /* 
        #swagger.responses[201] = {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/rule"
                    }
                }
            }
        }
    */
})

app.put('/settings/:type', (req,res) => {
    /*
        #swagger.tags = ['Settings']
        #swagger.summary = 'Updates a rate limit rule'
        #swagger.description = 'Updates a rate limit rule'
    */

    const type = req.params.type
    // const limit = req.body?.limit
    // const period = req.body?.period
    const {limit, period} = req.body
    /* 
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/rule"
                    }
                }
            }
        }
    */

    const result = rateLimitService.update(type, limit, period)
    res.status(result.status).send(result.message)
    /* 
        #swagger.responses[200] = {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/rule"
                    }
                }
            }
        }
    */
})

app.delete('/settings/', (req,res) => {
    /*
        #swagger.tags = ['Settings']
        #swagger.summary = 'Deletes all rate limit rules'
        #swagger.description = 'Deletes all rate limit rules'
    */

    const result = rateLimitService.deleteAll()
    res.status(result.status).send(result.message)
    /* 
        #swagger.responses[200] = {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/confirmDeletion"
                    }
                }
            }
        }
    */
})

app.delete('/settings/:type', (req,res) => {
    /*
        #swagger.tags = ['Settings']
        #swagger.summary = 'Deletes a rate limit rule'
        #swagger.description = 'Deletes a rate limit rule'
    */

    const type = req.params.type

    const result = rateLimitService.deleteOne(type)
    res.status(result.status).send(result.message)
    /* 
        #swagger.responses[200] = {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/confirmDeletion"
                    }
                }
            }
        }
    */
})

app.post('/notify/:userId', (req, res) => {
    /*
        #swagger.tags = ['Notifications']
        #swagger.summary = 'Sends a notification to a user'
        #swagger.description = 'Sends a notification to a user'
    */

    const userId = req.params.userId
    // const type = req.body?.type
    // const message = req.body?.message
    // const urgent = req.body?.urgent
    const {type, message, urgent} = req.body
    /* 
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/notification"
                    }
                }
            }
        }
    */

    const result = notificationService.send(type, userId, message, urgent)
    res.status(result.status).send(result.message)
    /* 
        #swagger.responses[200] = {
            content: {
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/confirmNotification"
                    }
                }
            }
        }
    */
})


// App start
const port = process.env.PORT || "3000";

app.listen(port, () => {
    console.log("Server listening on port", port);
})