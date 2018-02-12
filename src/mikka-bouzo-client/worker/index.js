import createStore from 'stockroom/worker';
import sockette from 'sockette';

import {get, postCommand} from './data-service';
import {handleEvent} from './event-handlers';

const WS_URL = 'wss://mikka-bouzo-api-tzdctwfrkk.now.sh/web-socket';
// const WS_URL = 'ws://localhost:3000/web-socket';
const messageQueue = [];

let webSocket;
let store = createStore({
	busy: false,
	aggregateId: null,
	pollQuestion: '',
	pollOptions: [],
	pollResults: {},
	totalVotes: 0
});

store.registerActions(store => ({
	createPoll(state, payload) {
		postCommand({type: 'CREATE_POLL', payload})
			.then(event => {
				queueMessage({type: 'SUBSCRIBE', aggregateId: event.aggregateId});
				store.setState({busy: false, ...handleEvent(store.getState(), event)});
			})
			.catch(_ => store.setState({busy: false}));
		return {busy: true};
	},
	getPollById(state, id) {
		queueMessage({type: 'SUBSCRIBE', aggregateId: id});
		get(`/poll/${id}`)
			.then(({events}) => {
				store.setState(events.reduce(handleEvent, store.getState()));
			})
			.catch(_ => store.setState({busy: false}));
		return {busy: true};
	},
	submitVote(state, payload) {
		postCommand({type: 'VOTE_ON_POLL', payload}, true)
			.then(console.log)
			.catch(_ => store.setState({busy: false}));
		return {busy: true};
	}
}));

if (!PRERENDER) {
	webSocket = sockette(WS_URL, {
		timeout: 5e3,
		maxAttempts: 3,
		onopen: _ => {
			while (messageQueue.length) {
				const message = messageQueue.shift();
				webSocket.send(message);
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
		onclose: console.info,
		onerror: console.error
	});
}

function queueMessage(message) {
	if (webSocket && webSocket.readyState === WebSocket.OPEN) {
		webSocket.send(JSON.stringify(message));
	} else {
		messageQueue.push(JSON.stringify(message));
	}
}

export default store;
