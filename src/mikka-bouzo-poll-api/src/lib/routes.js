import send from '@polka/send-type';

import {commandHandlers, isValidCommand} from './commands';

export default function createRoutes({store}) {
	return {
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
		postCommand: (request, response) => {
			if (!isValidCommand(request.body)) {
				return send(response, 400, {error: 'Invalid Command'});
			}
			try {
				const {type, payload} = request.body;
				const result = commandHandlers[type](store, payload);
				if (typeof result.then === 'function') {
					result
						.then(event => send(response, 201, event))
						.catch(err => send(response, 500, {error: err.message}));
				} else {
					send(response, 202, result);
				}
			} catch (err) {
				send(response, 400, {error: err.message});
			}
		}
	};
}
