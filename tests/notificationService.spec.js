const service = require('../src/services/notificationService')
const settings = require('../src/config/rateLimitSettings.json')
const gateway = require('../src/services/gatewayService')

const errorMessages = {
    400: "Request body could not be read properly",
    404: "Not found", 
    409: "Rules for the given type are already set",
    500: "Test internal server error"
}

describe('Test the notification processing of the notificationService following the rate limit rules', () => {
    beforeAll(() => {
        console.log = jest.fn()
        console.info = jest.fn()
        console.error = jest.fn()

        const gatewaySendMock = jest.spyOn(gateway.prototype, 'send').mockImplementation(() => {
            console.log('mocked function');
        })
    })

    it('Should send a notification of a type thats on the rate limit rules', async () => {
        settings['test-send'] = {limit: 1, period: 'second'}
        
        const type = 'test-send'
        const userId = 1
        const message = 'test'
        const urgent = false

        const response = service.send(type, userId, message, urgent)
        expect(response.status).toEqual(200)
        expect(response.message).toEqual("Notification sent")
    })

    it('Should send a notification of a type thats not on the rate limit rules', async () => {
        const type = 'promo'
        const userId = 1
        const message = 'test'
        const urgent = false

        const response = service.send(type, userId, message, urgent)
        expect(response.status).toEqual(200)
        expect(response.message).toEqual("Notification sent")
    })

    it('Should receive an error when trying to send a notification without a type', async () => {
        const type = undefined
        const userId = 1
        const message = 'test'
        const urgent = false

        const response = service.send(type, userId, message, urgent)
        expect(response.status).toEqual(400)
        expect(response.message).toEqual(errorMessages[400])
    })

    it('Should receive an error when trying to send a notification without a userId', async () => {
        settings['test-send-bad-request-user'] = {limit: 1, period: 'second'}

        const type = 'test-send-bad-request-user'
        const userId = undefined
        const message = 'test'
        const urgent = false

        const response = service.send(type, userId, message, urgent)
        expect(response.status).toEqual(400)
        expect(response.message).toEqual(errorMessages[400])
    })

    it('Should receive an error when trying to send a notification without a message', async () => {
        settings['test-send-bad-request-message'] = {limit: 1, period: 'second'}

        const type = 'test-send-bad-request-message'
        const userId = 1
        const message = undefined
        const urgent = false

        const response = service.send(type, userId, message, urgent)
        expect(response.status).toEqual(400)
        expect(response.message).toEqual(errorMessages[400])
    })

    it('Should send notifications of a type for a user up to the limit and not send anymore', async () => {
        settings['test-limit'] = {limit: 5, period: 'day'}

        const type = 'test-limit'
        const userId = 1
        const message = 'test'
        const urgent = false
        const limit = settings[type]['limit']
        
        for(var i = 0; i < limit; i++){
            const shouldSend = service.send(type, userId, message, urgent)
    
            expect(shouldSend.status).toEqual(200)
            expect(shouldSend.message).toEqual("Notification sent")
        }

        const shouldNotSend = service.send(type, userId, message, urgent)
        expect(shouldNotSend.status).toEqual(429)
        expect(shouldNotSend.message).toEqual(`User ${userId} has already received too many requests`)
    })

    it('Should send notifications of a type for a user up to the limit and then send notification of another type succesfuly', async () => {
        settings['test-limit-type1'] = {limit: 1, period: 'minute'}
        settings['test-limit-type2'] = {limit: 1, period: 'minute'}

        const type = 'test-limit-type1'
        const userId = 1
        const message = 'test'
        const urgent = false

        const shouldSend = service.send(type, userId, message, urgent)
        expect(shouldSend.status).toEqual(200)
        expect(shouldSend.message).toEqual("Notification sent")

        const shouldNotSend = service.send(type, userId, message, urgent)
        expect(shouldNotSend.status).toEqual(429)
        expect(shouldNotSend.message).toEqual(`User ${userId} has already received too many requests`)

        const newType = 'test-limit-type2'
        const shouldSendNewType = service.send(newType, userId, message, urgent)
        expect(shouldSendNewType.status).toEqual(200)
        expect(shouldSendNewType.message).toEqual("Notification sent")
    })

    it('Should send notifications of a type for a user up to the limit and then send notification of the same type to another user', async () => {
        settings['test-limit-different-users'] = {limit: 1, period: 'minute'}

        const type = 'test-limit-different-users'
        const userId = 1
        const anotherUserId = 2
        const message = 'test'
        const urgent = false

        const shouldSend = service.send(type, userId, message, urgent)
        expect(shouldSend.status).toEqual(200)
        expect(shouldSend.message).toEqual("Notification sent")

        const shouldNotSend = service.send(type, userId, message, urgent)
        expect(shouldNotSend.status).toEqual(429)
        expect(shouldNotSend.message).toEqual(`User ${userId} has already received too many requests`)

        const shouldSendNewType = service.send(type, anotherUserId, message, urgent)
        expect(shouldSendNewType.status).toEqual(200)
        expect(shouldSendNewType.message).toEqual("Notification sent")
    })

    it('Should send notifications of a type for a user up to the limit and then send a notification of same type as urgent', async () => {
        settings['test-urgent'] = {limit: 1, period: 'day'}

        const type = 'test-urgent'
        const userId = 1
        const message = 'test'
        var urgent = false
        const limit = settings[type]['limit']

        const shouldSend = service.send(type, userId, message, urgent)
        expect(shouldSend.status).toEqual(200)
        expect(shouldSend.message).toEqual("Notification sent")

        const shouldNotSend = service.send(type, userId, message, urgent)
        expect(shouldNotSend.status).toEqual(429)
        expect(shouldNotSend.message).toEqual(`User ${userId} has already received too many requests`)

        urgent = true;
        const shouldSendUrgent = service.send(type, userId, message, urgent)

        expect(shouldSendUrgent.status).toEqual(200)
        expect(shouldSendUrgent.message).toEqual("Notification sent")
    })

    it('Should receive an error if the gateway service fails', async () => {
        const gatewaySendMock = jest.spyOn(gateway.prototype, 'send').mockImplementation(() => {
            throw Error(errorMessages[500])
        })
        settings['test-gateway-fail'] = {limit: 1, period: 'day'}

        const type = 'test-gateway-fail'
        const userId = 1
        const message = 'test'
        const urgent = false

        const response = service.send(type, userId, message, urgent)
        expect(response.status).toEqual(500)
        expect(response.message).toEqual(errorMessages[500])
    })
    
    afterAll(() => {
        jest.clearAllMocks();
    });
})

