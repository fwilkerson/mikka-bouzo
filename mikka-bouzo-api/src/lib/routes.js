import send from '@polka/send-type';

import {commandHandlers, isValidCommand} from './commands';

const connections = {};

function publish(event) {
	const {aggregateId} = event;
	const data = JSON.stringify(event);
	connections[aggregateId].forEach(response => {
		response.write(`data: ${data}\n\n`);
	});
}

export default function createRoutes({store}) {
	store.publish = publish;
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
		},
		subscribe: (request, response) => {
			response.writeHead(200, {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			});
			const {aggregateId} = request.params;
			if (!Array.isArray(connections[aggregateId])) {
				connections[aggregateId] = [];
			}
			connections[aggregateId].push(response);
		}
	};
}
