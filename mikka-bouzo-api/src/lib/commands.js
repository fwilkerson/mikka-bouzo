import cuid from 'cuid';

import {commandTypes, eventTypes} from './constants';
import {count, isNullOrWhiteSpace} from './utils';

const createErrorEvent = err => ({
	aggregateId: err.docId,
	type: err.name,
	payload: {message: err.message}
});

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

export const commandHandlers = {
	[commandTypes.CREATE_POLL]: async (store, payload) => {
		// 1. Validate payload
		const {pollOptions, pollQuestion} = payload;

		if (!Array.isArray(pollOptions) || typeof pollQuestion !== 'string') {
			throw new TypeError('Invalid payload');
		}

		if (count(pollQuestion) === 0) {
			throw new Error('A question is required to create a poll');
		}

		if (count(pollQuestion) > 255) {
			throw new Error('A poll question cannot be greater than 255 characters');
		}

		if (count(pollOptions, option => !isNullOrWhiteSpace(option)) < 2) {
			throw new Error('Polls need at least two options');
		}

		if (count(pollOptions, option => count(option) > 255)) {
			throw new Error('A poll option cannot be greater than 255 characters');
		}

		// 2. Create the event
		const event = {
			aggregateId: cuid(),
			type: eventTypes.POLL_CREATED,
			payload: {
				pollOptions: pollOptions.filter(option => !isNullOrWhiteSpace(option)),
				pollQuestion
			}
		};

		// 3. Commit the event
		await store.append(Object.assign({}, event, {_id: event.aggregateId}));

		// 4. Return the aggregateId to the client
		return event;
	},
	[commandTypes.VOTE_ON_POLL]: (store, payload) => {
		// 1. Validate payload
		const {aggregateId, selectedOptions} = payload;

		if (typeof aggregateId !== 'string' || !Array.isArray(selectedOptions)) {
			throw new TypeError('Invalid payload');
		}

		if (count(selectedOptions) === 0) {
			throw new Error('A selected option is required to vote');
		}

		if (count(selectedOptions, option => count(option) > 255)) {
			throw new Error('A poll option cannot be greater than 255 characters');
		}

		// 2. Check if aggregate exists
		store
			.getById(aggregateId)
			.then(() => {
				// 4. Create the event
				const event = {
					aggregateId,
					type: eventTypes.POLL_VOTED_ON,
					payload: {selectedOptions}
				};

				// 5. Commit the event
				store
					.append(Object.assign({}, event, {_id: cuid()}))
					.then(() => store.publish(event))
					.catch(err => store.publish(createErrorEvent(err)));
			})
			.catch(err => store.publish(createErrorEvent(err)));

		// 3. Return the aggregateId to the client
		return {aggregateId};
	}
};
