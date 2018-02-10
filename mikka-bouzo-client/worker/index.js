import createStore from 'stockroom/worker';
import sockette from 'sockette';

// const API_URL = 'https://mikka-bouzo-api-hyjrtsmgdm.now.sh/api';
// const WS_URL = 'wss://mikka-bouzo-api-hyjrtsmgdm.now.sh/web-socket';
const API_URL = 'http://localhost:3000/api';
const WS_URL = 'ws://localhost:3000/web-socket';

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
				store.setState({busy: false, ...handleEvent(store.getState(), event)});
			})
			.catch(_ => store.setState({busy: false}));
		return {busy: true};
	},
	getPollById(state, id) {
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

const eventHandlers = {
	POLL_CREATED: (state, event) => {
		const {aggregateId, payload: {pollQuestion, pollOptions}} = event;
		const pollResults = {};
		pollOptions.forEach(option => {
			pollResults[option] = 0;
		});
		return {...state, aggregateId, pollResults, pollQuestion, pollOptions};
	},
	POLL_VOTED_ON: (state, event) => {
		const {pollResults, totalVotes} = state;
		const {payload} = event;
		const updates = {};
		payload.selectedOptions.forEach(option => {
			updates[option] = pollResults[option] + 1;
		});
		return {
			...state,
			pollResults: {...pollResults, ...updates},
			totalVotes: totalVotes + 1
		};
	}
};

function handleEvent(state, event) {
	return eventHandlers[event.type]
		? eventHandlers[event.type](state, event)
		: state;
}

if (PRERENDER) {
} else {
	const webSocket = sockette(WS_URL, {
		timeout: 5e3,
		maxAttempts: 3,
		onopen: console.info,
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

function get(route) {
	return fetch(API_URL + route).then(response => response.json());
}

function postCommand(command) {
	const options = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(command)
	};
	return fetch(API_URL + '/command', options).then(response => response.json());
}

export default store;
