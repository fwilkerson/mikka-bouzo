import send from '@polka/send-type';
import uuid from 'uuid/v4';

export default ({store, wss}) => ({
	getIndex: (request, response) => {
		send(response, 200, {message: 'A three day monk'});
	},
	getPollById: async (request, response) => {
		try {
			const {aggregateId} = request.params;
			const events = await store.get(aggregateId);
			send(response, 200, events, {
				'Content-Type': 'application/json; charset=utf-8'
			});
		} catch (err) {
			send(response, 500, err);
		}
	},
	getPollResultsById: (request, response) => {
		const {aggregateId} = request.params;
		send(response, 200, {aggregateId});
	},
	postCommand: async (request, response) => {
		try {
			const command = request.body;
			const aggregateId = uuid();
			send(response, 202, {aggregateId});
			const payload = JSON.stringify([command]);
			await store.put(aggregateId, payload);
			wss.broadcast(payload);
		} catch (err) {
			send(response, 500, err);
		}
	}
});
