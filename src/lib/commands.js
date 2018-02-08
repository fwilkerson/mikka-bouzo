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

function count(iterable, predicate) {
	if (predicate === undefined || typeof iterable === 'string') {
		return iterable.length;
	}
	return iterable.filter(predicate).length;
}

function isNullOrWhiteSpace(str) {
	return str === null || str === undefined || str.trim() === '';
}

function createPoll(store, payload) {
	// 1. Validate payload
	const {pollOptions, pollQuestion} = payload;

	if (!Array.isArray(pollOptions) || typeof pollQuestion !== 'string') {
		throw new TypeError('Invalid payload');
	}

	if (count(pollQuestion) === 0) {
		throw new Error('A question is required to create a poll');
	}

	if (count(pollOptions, option => !isNullOrWhiteSpace(option)) < 2) {
		throw new Error('Polls need at least two options');
	}

	// 2. Create the event
	const event = {
		aggregateId: uuid(),
		type: eventTypes.POLL_CREATED,
		payload: {
			pollOptions: pollOptions.filter(option => !isNullOrWhiteSpace(option)),
			pollQuestion
		}
	};

	// 3. Commit the event
	store
		.append(Object.assign({}, event, {_id: String(++store.sequence)}))
		.then(() => store.publish(event))
		.catch(console.error);

	// 4. Return the aggregateId to the client
	return {aggregateId: event.aggregateId};
}

function voteOnPoll(store, payload) {
	// 1. Validate payload
	const {aggregateId, selectedOptions} = payload;

	if (typeof aggregateId !== 'string' || !Array.isArray(selectedOptions)) {
		throw new TypeError('Invalid payload');
	}

	if (count(selectedOptions) === 0) {
		throw new Error('A selected option is required to vote');
	}

	// 2. Create the event
	const event = {
		aggregateId,
		type: eventTypes.POLL_VOTED_ON,
		payload: {selectedOptions}
	};

	// 3. Commit the event
	store
		.append(Object.assign({}, event, {_id: String(++store.sequence)}))
		.then(() => store.publish(event))
		.catch(console.error);

	// 4. Return the aggregateId to the client
	return {aggregateId};
}

export const commandHandlers = {
	[commandTypes.CREATE_POLL]: createPoll,
	[commandTypes.VOTE_ON_POLL]: voteOnPoll
};
