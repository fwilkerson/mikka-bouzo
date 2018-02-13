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

let webSocketState = WebSocket.CLOSED;
let webSocket = null;

store.registerActions(store => ({
	createPoll(state, payload) {
		postCommand({type: commandTypes.CREATE_POLL, payload})
			.then(event => {
				queueMessage({
					type: socketMessages.SUBSCRIBE,
					aggregateId: event.aggregateId
				});
				store.setState({busy: false, ...handleEvent(store.getState(), event)});
			})
			.catch(() => store.setState({busy: false}));
		return {busy: true};
	},
	getPollById(state, id) {
		queueMessage({type: socketMessages.SUBSCRIBE, aggregateId: id});
		get(`/poll/${id}`)
			.then(({events}) => {
				store.setState(events.reduce(handleEvent, store.getState()));
			})
			.catch(() => store.setState({busy: false}));
		return {busy: true};
	},
	submitVote(state, payload) {
		postCommand({type: commandTypes.VOTE_ON_POLL, payload}, true)
			.then(console.log)
			.catch(() => store.setState({busy: false}));
		return {busy: true};
	}
}));

if (!PRERENDER) {
	webSocket = new Sockette(WS_URL, {
		timeout: 5e3,
		maxAttempts: 3,
		onopen: () => {
			webSocketState = WebSocket.OPEN;
			while (messageQueue.length) {
				const message = messageQueue.shift();
				webSocket.json(message);
			}
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
		onclose: () => {
			webSocketState = WebSocket.CLOSED;
		},
		onerror: err => {
			webSocketState = WebSocket.CLOSED;
			console.error(err);
		},
		onmaximum: console.info
	});
}

function queueMessage(message) {
	if (webSocket && webSocketState === WebSocket.OPEN) {
		webSocket.json(message);
	} else {
		messageQueue.push(message);
	}
}

export default store;
