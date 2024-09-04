# Rate Limited Notification Service

This is a REST API built to use and maintain a rate limited notification service. It lets the user send notifications of different types to different users while obeying a set of rate limit rules. This set of rules can be managed through this API as well.

## Requirements

* Node.js

## Build and run

Onde cloned from git the application can be built by running:

```bash
npm run build
```

or

```bash
npm install
```

Then, to start the API, simply run:

```bash
npm start
```

The API will start on `localhost` and will be listening to port `3000`.

You can use it either by using a program like Postman or by making cURL calls to the endpoints described below.

You can also check `localhost:3000/docs` to check the Swagger UI and try the different endpoints with documentation and examples.

## Endpoints

The following endpoints are exposed by the API

| HTTP method | Endpoint         | Request                                                  | Description                           |
| ----------- | ---------------- | -------------------------------------------------------- | ------------------------------------- |
| POST        | /notify/{userId} | { "type": string, "message": string, "urgent": boolean } | Sends a notification to a user        |
| GET         | /settings        |                                                          | Returns all rate limit rules          |
| GET         | /settings/{type} |                                                          | Returns a rate limit rule by its name |
| POST        | /settings/{type} | { "limit": number, "period": string }                    | Creates a new rate limit rule         |
| PUT         | /settings/{type} | { "limit": number, "period": string }                    | Updates a rate limit rule             |
| DELETE      | /settings        |                                                          | Deletes all rate limit rules          |
| DELETE      | /settings/{type} |                                                          | Deletes a rate limit rule             |

## Specifications and improvements

This API was built following the specifications on the `spec.txt` file. It should send notifications to users and block them if a rate limit was reached.

I followed these instructions and used the sample rate limit rules as an initial state of the api.

I also took the liberty of improving on it on the following points:

* Manage the rate limit rules (create, read, update and delete)
* Send urgent notifications that would bypass the rate limit

## Suggestion of future implementations

* Authentication
* Use Redis to store the messages TTL instead of an in-memory object
