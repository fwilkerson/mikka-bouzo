import {json} from 'body-parser';
import cors from 'cors';
import polka from 'polka';

import createRoutes from './lib/routes';
import createStore from './lib/store';

(async () => {
	const {PORT = 3000} = process.env;
	const app = polka()
		.use(cors())
		.use(json());
	const store = await createStore({server: app.server});
	const {getPollById, postCommand} = createRoutes({store});

	app
		.get('/api/poll/:aggregateId', getPollById)
		.post('/api/command', postCommand);

	await app.listen(PORT);

	console.log(`> Running on port ${PORT}`);

	return app;
})();
