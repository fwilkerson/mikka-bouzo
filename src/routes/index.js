import level from 'level';
import send from '@polka/send-type';
import uuid from 'uuid/v4';

const db = level('./dist/event-store');

export function getIndex(request, response) {
	send(response, 200, {message: 'A three day monk'});
}

export async function getPollById(request, response) {
	try {
		const {aggregateId} = request.params;
		const events = await db.get(aggregateId);
		send(response, 200, events, {
			'Content-Type': 'application/json; charset=utf-8'
		});
	} catch (err) {
		send(response, 500, err);
	}
}

export function getPollResultsById(request, response) {
	const {aggregateId} = request.params;
	send(response, 200, {aggregateId});
}

export async function postCommand(request, response) {
	try {
		const command = request.body;
		const aggregateId = uuid();
		await db.put(aggregateId, JSON.stringify([command]));
		send(response, 202, {aggregateId});
	} catch (err) {
		send(response, 500, err);
	}
}
