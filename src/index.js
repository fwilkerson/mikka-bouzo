import parser from 'body-parser';
import polka from 'polka';

import createRoutes from './lib/routes';
import createStore from './lib/store';

(async () => {
	const {PORT = 3000} = process.env;

	const app = polka().use(parser.json());
	const store = await createStore({app, location: 'event-store'});
	const {getPollById, postCommand} = createRoutes({store});

	app
		.get('/api/poll/:aggregateId', getPollById)
		.post('/api/command', postCommand);

	await app.listen(PORT);

	console.log(`> Running on port ${PORT}`);

	return app;
})();
