# LRS

Learning Record Store

This LRS saves all of the information to the MongoDB.
For more information please refer to [xAPI.com](https://xapi.com/learning-record-store/)

## Installing / Getting started

_Make sure to install MongoDB._

Then install node modules with

```sh
npm install
```

Add the following to env file

```
PORT={{your-lrs-port}}
MONGO_URL=mongodb://{{mongo-host}}:{{mongo-port}}
MONGO_DB={{mongo-db-name}}
MONGO_COLLECTION={{mongo-collection-name}}
```

If your Mongo installation has a username and authentication, _please embed it in MONGO_URL_

### Running

To run LRS simply use node

```sh
node app.js
```

### LRS Endpoint

LRS accepts JSON data at `/lrs` post route
