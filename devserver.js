const path = require('path');
const express = require('express');
const morgan = require('morgan');
const webpack = require('webpack');
const config = require('./webpack.config');

const port = 8800;
const app = express();
const compiler = webpack(config);

app.use(morgan('dev'));
app.use(express.static(process.cwd()));

app.use(require('webpack-dev-middleware')(compiler, {
	noInfo: true,
	publicPath: config.output.publicPath,
}));

app.use(require('webpack-hot-middleware')(compiler));

// proxying of api requests
const makeProxy = require('./index');
app.all('/api/*', makeProxy({ port: 3000 }));

app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', (err) => {
	if (err) {
		console.log(err);
		return;
	}
	console.log('Listening at http://0.0.0.0:%s', port);
});
