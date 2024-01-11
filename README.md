# LRS

Learning Record Store

This LRS saves all of the information to the MongoDB.
For more information please refer to [xAPI.com](https://xapi.com/learning-record-store/)

The repository contains backend and frontend. The backend features Express app. Frontend is composed of React app.

### LRS Endpoint

LRS accepts JSON data at `/lrs` post route.

## Getting started

_Make sure to install MongoDB._

Add the following to env file

```
PORT={{your-lrs-port}}
MONGO_URL=mongodb://{{mongo-host}}:{{mongo-port}}
MONGO_DB={{mongo-db-name}}
MONGO_XAPI_COLLECTION={{mongo-collection-name-for-xAPI-records}}
SECRET={{secret-for-jwt-tokens}}
LRS_SHARED_KEY={{secret-shared-key-for-communication-from-H5P}}
```

If your Mongo installation has a username and authentication, please embed it in MONGO_URL

### Installing Node Modules

Install node modules with

```sh
npm install
```

Additionally, you would want to install node modules for frontend as well.

```sh
cd frontend
npm install
```

## Development

To run the app locally, please use

```sh
npm run start:dev
```

This will start nodemon (be sure to install it globally via npm install nodemon -g)

To run the frontend seperate for debugging please use

```sh
cd frontend && npm run dev
```

This will start the Create React App for local development on a different port

## Deployment

To deploy LRS on the server, install node modules on the root folder and in the frontend folder. Then build the frontend app and finally serve the frontend with ExpressJS backend app. Use the following steps

```sh
npm run install
cd frontend && npm run install && npm run build
cd ..
npm run start
```
