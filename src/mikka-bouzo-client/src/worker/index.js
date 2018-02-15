import createStore from 'stockroom/worker';

import {connectSocket, get, postCommand, queueMessage} from './data-service';
import {handleEvent} from './event-handlers';
import {commandTypes, socketMessages} from '../constants';

const store = createStore({
	busy: false,
	aggregateId: null,
	pollQuestion: '',
	pollOptions: [],
	pollResults: {},
	totalVotes: 0
});
connectSocket(store);
store.registerActions(store => ({createPoll, getPollById, submitVote}));

function subscribe(aggregateId) {
	return {type: socketMessages.SUBSCRIBE, aggregateId};
}

async function createPoll(state, payload) {
	try {
		store.setState({busy: true});
		const event = await postCommand({type: commandTypes.CREATE_POLL, payload});
		queueMessage(subscribe(event.aggregateId));
		return {...handleEvent(store.getState(), event), busy: false};
	} catch (err) {
		console.error(err);
		return {busy: false};
	}
}

async function getPollById(state, id) {
	try {
		store.setState({busy: true});
		queueMessage(subscribe(id));
		const {events} = await get(`/poll/${id}`);
		return {...events.reduce(handleEvent, store.getState()), busy: false};
	} catch (err) {
		console.error(err);
		return {busy: false};
	}
}

async function submitVote(state, payload) {
	try {
		store.setState({busy: true});
		await postCommand({type: commandTypes.VOTE_ON_POLL, payload});
	} catch (err) {
		console.error(err);
	} finally {
		return {busy: false};
	}
}

export default store;
