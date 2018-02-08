import parser from 'body-parser';
import polka from 'polka';

import createRoutes from './lib/routes';
import createStore from './lib/store';

(async () => {
	const {PORT = 3000, HOST = '::'} = process.env;

	const app = polka().use(parser.json());
	const store = await createStore({app, location: './dist/event-store'});
	const routes = createRoutes({store});

	app
		.get('/', routes.getIndex)
		.get('/api/poll/:aggregateId', routes.getPollById)
		.get('/api/poll/:aggregateId/results', routes.getPollResultsById)
		.post('/api/command', routes.postCommand);

	await app.listen(PORT, HOST);

	console.log(`> Running on port ${PORT}`);

	return app;
})();
