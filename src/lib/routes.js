import send from '@polka/send-type';

import {commandHandlers, isValidCommand} from './commands';

export default ({store}) => ({
	getIndex: (request, response) => {
		send(response, 200, {message: 'A three day monk'});
	},
	getPollById: async (request, response) => {
		try {
			const {aggregateId} = request.params;
			const {docs} = await store.query({
				selector: {aggregateId},
				fields: ['aggregateId', 'type', 'payload']
			});
			send(response, 200, {events: docs, count: docs.length});
		} catch (err) {
			send(response, 500, err);
		}
	},
	getPollResultsById: (request, response) => {
		const {aggregateId} = request.params;
		send(response, 200, {aggregateId});
	},
	postCommand: (request, response) => {
		if (isValidCommand(request.body)) {
			try {
				const {type, payload} = request.body;
				const result = commandHandlers[type](store, payload);
				send(response, 202, result);
			} catch (err) {
				send(response, 400, {error: err.message});
			}
		} else {
			send(response, 400, {error: 'Invalid Command'});
		}
	}
});
