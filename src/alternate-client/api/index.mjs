import http from 'http';
import path from 'path';

import {buildCommandRouter, buildQueryRouter, send} from './lib';
import {createStore} from './store';

const READS = path.resolve('./api/read');
const WRITES = path.resolve('./api/write');

(async () => {
	let options = {
		store: await createStore(),
	};
	let queryRouter = await buildQueryRouter(READS, options);
	let commandRouter = await buildCommandRouter(WRITES, options);

	let app = http.createServer((request, response) => {
		response.setHeader('Content-Type', 'application/json; charset=utf-8');
		switch (request.method) {
			case 'GET':
				queryRouter(request, response);
				break;
			case 'POST':
				commandRouter(request, response);
				break;
			default:
				send(response, 404, {code: 404, message: 'Not Found'});
				break;
		}
	});

	app.listen(3000, () =>
		console.info('Server running on http://localhost:3000')
	);
})();
