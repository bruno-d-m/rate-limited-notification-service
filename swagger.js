const swaggerAutogen = require('swagger-autogen')({ openapi: '3.1.0' });

const doc = {
    info: {
        version: "1.0.0",
        title: "Modak",
        description: "Coding challenge for Modak Makers"
    },
    servers: [
        {
            url: 'http://localhost:3000'
        }
    ],
    components: {
        schemas: {
            rule: {
                $limit: 1,
                $period: "second"
            },
            setOfRules: {
                'rule-1': {
                    limit: 1,
                    period: "second"
                },
                'rule-2': {
                    limit: 1,
                    period: "minute"
                }
            },
            confirmDeletion: "A message confirming the deletion",
            notification: {
                $type: "news",
                $message: "This is a notification message",
                urgent: false
            },
            confirmNotification: "A message confirming the notification was sent"

        }
    }
}

const outputFile = './swagger-output.json'
const index = ['./index.js']

swaggerAutogen(outputFile, index, doc).then(() => {
    require('./index')
})