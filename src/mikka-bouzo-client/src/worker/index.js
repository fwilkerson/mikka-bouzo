import createStore from 'stockroom/worker';
import Sockette from 'sockette';

import {get, postCommand} from './data-service';
import {handleEvent} from './event-handlers';
import {commandTypes, socketMessages} from '../constants';

const WS_URL = 'wss://mikka-bouzo-poll-api-ckmhebiznl.now.sh/web-socket';
const messageQueue = [];
const store = createStore({
	busy: false,
	aggregateId: null,
	pollQuestion: '',
	pollOptions: [],
	pollResults: {},
	totalVotes: 0
});

let _ws;
let sockette;

store.registerActions(store => ({
	createPoll(state, payload) {
		postCommand({type: commandTypes.CREATE_POLL, payload})
			.then(event => {
				queueMessage({
					type: socketMessages.SUBSCRIBE,
					aggregateId: event.aggregateId
				});
				store.setState({...handleEvent(store.getState(), event), busy: false});
			})
			.catch(() => store.setState({busy: false}));
		return {busy: true};
	},
	getPollById(state, id) {
		queueMessage({type: socketMessages.SUBSCRIBE, aggregateId: id});
		get(`/poll/${id}`)
			.then(({events}) => {
				store.setState({
					...events.reduce(handleEvent, store.getState()),
					busy: false,
				});
			})
			.catch(() => store.setState({busy: false}));
		return {busy: true};
	},
	submitVote(state, payload) {
		postCommand({type: commandTypes.VOTE_ON_POLL, payload})
			.then(console.log)
			.catch(() => store.setState({busy: false}));
		return {busy: true};
	}
}));

if (!PRERENDER) {
	sockette = new Sockette(WS_URL, {
		timeout: 5e3,
		maxAttempts: 3,
		onopen: e => {
			while (messageQueue.length) {
				const message = messageQueue.shift();
				sockette.json(message);
			}

			_ws = e.target;
		},
		onmessage: message => {
			try {
				const event = JSON.parse(message.data);
				const state = store.getState();
				if (event.aggregateId === state.aggregateId) {
					store.setState(handleEvent(state, event));
				}
			} catch (err) {
				console.error(err);
			}
		},
		onreconnect: console.info,
		onclose: console.info,
		onerror: console.error,
		onmaximum: console.info
	});
}

function queueMessage(message) {
	if (sockette && _ws.readyState === WebSocket.OPEN) {
		sockette.json(message);
	} else {
		messageQueue.push(message);
	}
}

export default store;
