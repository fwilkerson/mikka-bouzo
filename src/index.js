import parser from 'body-parser';
import level from 'level';
import polka from 'polka';

import createRoutes from './lib/routes';
import createWebSocket from './lib/web-socket';

const store = level('./dist/event-store');
const service = polka().use(parser.json());
const wss = createWebSocket(service.server);
const routes = createRoutes({store, wss});
const {PORT = 3000, HOST = '::'} = process.env;

service
	.get('/', routes.getIndex)
	.get('/api/poll/:aggregateId', routes.getPollById)
	.get('/api/poll/:aggregateId/results', routes.getPollResultsById)
	.post('/api/command', routes.postCommand)
	.listen(PORT, HOST)
	.then(() => console.log(`> Running on port ${PORT}`))
	.catch(console.error);
