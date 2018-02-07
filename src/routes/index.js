import {json, send} from 'micro';

export function getIndex(request, response) {
	send(response, 200, {message: 'A three day monk'});
}

export function getPollById(request, response) {
	const {aggregateId} = request.params;
	send(response, 200, {aggregateId});
}

export function getPollResultsById(request, response) {
	const {aggregateId} = request.params;
	send(response, 200, {aggregateId});
}

export async function postCommand(request, response) {
	const command = await json(request);
	send(response, 202, {command});
}
