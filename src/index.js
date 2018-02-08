import parser from 'body-parser';
import polka from 'polka';

import createRoutes from './lib/routes';
import createStore from './lib/store';
import createWebSocket from './lib/web-socket';

async function start() {
	const store = await createStore('./dist/event-store');

	const service = polka().use(parser.json());
	const wss = createWebSocket(service.server);
	const routes = createRoutes({store, wss});
	const {PORT = 3000, HOST = '::'} = process.env;

	await service
		.get('/', routes.getIndex)
		.get('/api/poll/:aggregateId', routes.getPollById)
		.get('/api/poll/:aggregateId/results', routes.getPollResultsById)
		.post('/api/command', routes.postCommand)
		.listen(PORT, HOST);

	console.log(`> Running on port ${PORT}`);
}

start();
