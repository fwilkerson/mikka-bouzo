import createStore from 'stockroom/worker';
import sockette from 'sockette';

let store = createStore({
	saving: false,
	aggregateId: null,
	pollQuestion: '',
	pollResults: {},
	totalVotes: 0
});

store.registerActions(store => ({
	createPoll(state, payload) {
		postCommand({type: 'CREATE_POLL', payload})
			.then(console.log)
			.catch(console.error);
		return {saving: true};
	}
}));

const waiting = {};
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

function onReceive(event) {
	const {type, payload} = JSON.parse(event.data);

	// the dataService is expecting and has handled the ws message
	if (isWaiting(payload)) {
		return;
	}

	switch (type) {
		default:
			console.info(type, payload);
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

function get(route) {
	return fetch(route)
		.then(response => response.json())
		.catch(console.error);
}

function postCommand(command, eventually = false) {
	const options = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(command)
	};
	return fetch('https://mikka-bouzo-api-dwlwamwavz.now.sh/api/command', options)
		.then(response => response.json())
		.then(data => {
			if (data.error) {
				Promise.reject(data.error);
			} else {
				// tell the server to subscribe us to messages for this aggregate
				joinChannel(data.aggregateId);
				if (eventually) {
					return eventually(data.aggregateId);
				} else {
					return data;
				}
			}
		})
		.catch(console.error);
}

export default store;
