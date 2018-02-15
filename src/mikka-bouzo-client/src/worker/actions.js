import {commands, messages} from '../constants';
import {get, postCommand, queueMessage} from './data-service';
import {handleEvent} from './event-handlers';

function subscribe(aggregateId) {
	return {type: messages.SUBSCRIBE, aggregateId};
}

export default store => ({
	createPoll: async (state, payload) => {
		try {
			store.setState({busy: true});
			const event = await postCommand({type: commands.CREATE_POLL, payload});
			queueMessage(subscribe(event.aggregateId));
			return {...handleEvent(store.getState(), event), busy: false};
		} catch (err) {
			console.error(err);
			return {busy: false};
		}
	},
	getPollById: async (state, id) => {
		try {
			store.setState({busy: true});
			queueMessage(subscribe(id));
			const {events} = await get(`/poll/${id}`);
			return {...events.reduce(handleEvent, store.getState()), busy: false};
		} catch (err) {
			console.error(err);
			return {busy: false};
		}
	},
	submitVote: async (state, payload) => {
		try {
			store.setState({busy: true});
			await postCommand({type: commands.VOTE_ON_POLL, payload});
		} catch (err) {
			console.error(err);
		} finally {
			return {busy: false};
		}
	}
});
