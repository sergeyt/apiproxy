# apiproxy
Express.js middleware to easily proxy REST API requests.

## Usage

```
const express = require('express');
const app = express();
// proxying of api requests
const makeProxy = require('./apiproxy');
app.all('/api/*', makeProxy({ port: 3000 }));
```
