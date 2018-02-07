import parse from 'parseurl';

import {send} from 'micro';
import Router from 'trouter';

import {getIndex, getPollById, getPollResultsById, postCommand} from './routes';

const router = new Router()
	.get('/', getIndex)
	.get('/api/poll/:aggregateId', getPollById)
	.get('/api/poll/:aggregateId/results', getPollResultsById)
	.post('/api/command', postCommand);

export default (request, response) => {
	const {pathname} = parse(request);
	const route = router.find(request.method, pathname);
	if (route) {
		request.params = route.params;
		return route.handler(request, response);
	}
	send(response, 404, {error: `I can't seem to find what you're looking for`});
};
