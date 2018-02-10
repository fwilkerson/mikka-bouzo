import createStore from 'stockroom/worker';
import sockette from 'sockette';

const API_URL = 'https://mikka-bouzo-api-dwlwamwavz.now.sh/api';
const waiting = {};
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

const ws = sockette('wss://mikka-bouzo-api-dwlwamwavz.now.sh/ws', {
	timeout: 5e3,
	maxAttempts: 3,
	onopen: console.debug,
	onmessage: onReceive,
	onreconnect: console.debug,
	onclose: console.debug,
	onerror: console.error
});

function isWaiting(data) {
	if (typeof waiting[data.aggregateId] === 'function') {
		waiting[data.aggregateId](data);
		delete waiting[data.aggregateId];
		return true;
	}

	return false;
}

function onReceive(message) {
	const event = JSON.parse(message.data);

	// the dataService is expecting and has handled the ws message
	if (isWaiting(event)) {
		return;
	}

	switch (event.type) {
		default:
			console.info(event);
			break;
	}
}

function eventually(aggregateId) {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			if (waiting[aggregateId]) {
				// you never called :(
				delete waiting[aggregateId];
				return reject(new Error('eventually timed out'));
			}
		}, 5e3);

		// call me maybe?
		waiting[aggregateId] = data => {
			clearTimeout(timeoutId);
			return resolve(data);
		};
	});
}

function joinChannel(channel) {
	if (ws) {
		ws.json({type: 'JOIN_CHANNEL', payload: channel});
	}
}

function leaveChannel(channel) {
	if (ws) {
		ws.json({type: 'LEAVE_CHANNEL', payload: channel});
	}
}

async function get(route) {
	const response = await fetch(API_URL + route);
	return await response.json();
}

async function postCommand(command, wait = false) {
	const options = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(command)
	};
	const response = await fetch(API_URL + '/command', options);
	const data = await response.json();
	if (data.error) {
		return data.error;
	}
	// tell the server to subscribe us to messages for this aggregate
	joinChannel(data.aggregateId);

	if (wait) {
		return eventually(data.aggregateId);
	} else {
		return data;
	}
}

export default store;
