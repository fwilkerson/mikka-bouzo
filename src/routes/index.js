import send from '@polka/send-type';

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
	send(response, 202, {command: request.body});
}
