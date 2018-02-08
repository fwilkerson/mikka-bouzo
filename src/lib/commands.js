import uuid from 'uuid/v4';

export const commandTypes = {
	CREATE_POLL: 'CREATE_POLL',
	VOTE_ON_POLL: 'VOTE_ON_POLL'
};

export const eventTypes = {
	POLL_CREATED: 'POLL_CREATED',
	POLL_VOTED_ON: 'POLL_VOTED_ON'
};

export function isValidCommand(command) {
	return (
		command !== null &&
		typeof command === 'object' &&
		'type' in command &&
		typeof command.type === 'string' &&
		command.type in commandTypes &&
		'payload' in command &&
		command.payload !== null &&
		typeof command.payload === 'object'
	);
}

async function createPoll(store, payload) {
	// 1. Validate payload

	// 2. Generate aggregateId
	const aggregateId = uuid();

	// 3. Commit the event
	try {
		await store.append({
			_id: String(++store.sequence),
			aggregateId,
			type: eventTypes.POLL_CREATED,
			payload
		});
	} catch (err) {
		return Promise.reject(err);
	}

	// 4. Return the aggregateId to the client
	return {aggregateId};
}

async function voteOnPoll(store, payload) {
	// 1. Validate payload
	const {aggregateId} = payload;

	// 2. Commit the event
	try {
		await store.append({
			_id: String(++store.sequence),
			aggregateId,
			type: eventTypes.POLL_VOTED_ON,
			payload
		});
	} catch (err) {
		return Promise.reject(err);
	}

	// 3. Return the aggregateId to the client
	return {aggregateId};
}

export const commandHandlers = {
	[commandTypes.CREATE_POLL]: createPoll,
	[commandTypes.VOTE_ON_POLL]: voteOnPoll
};
