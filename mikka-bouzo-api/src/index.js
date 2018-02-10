import {json} from 'body-parser';
import cors from 'cors';
import polka from 'polka';

import createRoutes from './lib/routes';
import createStore from './lib/store';

(async () => {
	const {PORT = 3000} = process.env;
	const store = await createStore({location: 'event-store'});
	const {getPollById, postCommand, subscribe} = createRoutes({store});

	const app = polka()
		.use(cors())
		.use(json())
		.get('/api/poll/:aggregateId', getPollById)
		.post('/api/command', postCommand)
		.get('/api/subscribe/:aggregateId', subscribe);

	await app.listen(PORT);

	console.log(`> Running on port ${PORT}`);

	return app;
})();
