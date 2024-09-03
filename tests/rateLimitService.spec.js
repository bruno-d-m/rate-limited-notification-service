const service = require('../src/services/rateLimitService')
const settings = require('../src/config/rateLimitSettings.json')

const errorMessages = {
    400: "Request body could not be read properly",
    404: "Not found", 
    409: "Rules for the given type are already set"
}

describe('Test the operations on the rate limit rules', () => {
    beforeAll(() => {
        console.log = jest.fn()
        console.info = jest.fn()
        console.error = jest.fn()
    })

    it('Should retrieve all the current rules', async () => {
        const rules = service.getAll()

        expect(rules.status).toEqual(200)
        expect(rules.message).toEqual(settings)
    })

    it('Should retrieve one specific rule', async () => {
        const type = 'news'
        const rule = service.getOne(type)
        
        expect(rule.status).toEqual(200)
        expect(rule.message).toEqual(settings[type])
    })

    it('Should receive an error when trying to retrieve a rule that doesnt exist', async () => {
        const type = 'invitation'
        const rule = service.getOne(type)
        
        expect(rule.status).toEqual(404)
        expect(rule.message).toEqual(errorMessages[404])
    })

    it('Should create a new rule', async () => {
        const type = 'invitation'
        const limit = 2
        const period = 'minute'
        const newRule = {limit, period}

        const response = service.create(type, limit, period)
        
        expect(response.status).toEqual(201)
        expect(response.message).toEqual(newRule)
    })

    it('Should receive an error when trying to create a new rule without a limit', async () => {
        const type = 'invitation'
        const limit = undefined
        const period = 'minute'

        const response = service.create(type, limit, period)
        
        expect(response.status).toEqual(400)
        expect(response.message).toEqual(errorMessages[400])
    })

    it('Should receive an error when trying to create a new rule without a period', async () => {
        const type = 'invitation'
        const limit = 2
        const period = undefined

        const response = service.create(type, limit, period)
        
        expect(response.status).toEqual(400)
        expect(response.message).toEqual(errorMessages[400])
    })

    it('Should receive an error when trying to create a rule that already exists', async () => {
        const type = 'news'
        const limit = 2
        const period = 'minute'

        const response = service.create(type, limit, period)
        
        expect(response.status).toEqual(409)
        expect(response.message).toEqual(errorMessages[409])
    })

    it('Should update an existing rule', async () => {
        const type = 'news'
        const limit = 3
        const period = 'hour'
        const updatedRule = {limit, period}

        const response = service.update(type, limit, period)

        expect(response.status).toEqual(200)
        expect(response.message).toEqual(updatedRule)
    })

    it('Should create a new rule when trying to update a rule that doesnt exist', async () => {
        const type = 'promo'
        const limit = 3
        const period = 'day'
        const newRule = {limit, period}

        const response = service.update(type, limit, period)

        expect(response.status).toEqual(201)
        expect(response.message).toEqual(newRule)
    })

    it('Should receive an error when trying to update a rule without a limit', async () => {
        const type = 'news'
        const limit = undefined
        const period = 'hour'

        const response = service.update(type, limit, period)

        expect(response.status).toEqual(400)
        expect(response.message).toEqual(errorMessages[400])
    })

    it('Should receive an error when trying to update a rule without a period', async () => {
        const type = 'news'
        const limit = 3
        const period = undefined

        const response = service.update(type, limit, period)

        expect(response.status).toEqual(400)
        expect(response.message).toEqual(errorMessages[400])
    })

    it('Should delete an existing rule', async () => {
        const type = 'news'

        const response = service.deleteOne(type)
        
        expect(response.status).toEqual(200)
        expect(response.message).toEqual(`${type} rate limit rule deleted`)

        const notFound = service.getOne(type)
        expect(notFound.status).toEqual(404)
        expect(notFound.message).toEqual(errorMessages[404])
    })

    it('Should receive an error when trying to delete a rule that doesnt exist', async () => {
        const type = 'offer'

        const response = service.deleteOne(type)

        expect(response.status).toEqual(404)
        expect(response.message).toEqual(errorMessages[404])
    })

    it('Should delete all existing rules', async () => {
        const response = service.deleteAll()

        expect(response.status).toEqual(200)
        expect(response.message).toEqual("All rate limit rules were deleted")

        const empty = service.getAll()
        expect(empty.message).toEqual({})
    })
})