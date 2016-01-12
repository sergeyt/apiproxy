[![Build Status](https://travis-ci.org/sergeyt/apiproxy.svg)](https://travis-ci.org/sergeyt/apiproxy)

# apiproxy
Express.js middleware to easily proxy REST API requests.

## Usage

```js
const express = require('express');
const app = express();
// proxying of api requests
const makeProxy = require('apiproxy');
app.all('/api/*', makeProxy({ port: 3000 }));
```
