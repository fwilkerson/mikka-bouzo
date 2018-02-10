import createStore from 'stockroom/worker';

const API_URL = 'https://mikka-bouzo-api-srmlnqfwki.now.sh/api';
// const API_URL = 'http://localhost:3000/api';

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
				createEventSource(event.aggregateId);
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
		createEventSource(id);
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

function createEventSource(aggregateId) {
	const eventSource = new EventSource(`${API_URL}/subscribe/${aggregateId}`);

	eventSource.onerror = console.error;
	eventSource.onmessage = message => {
		try {
			const event = JSON.parse(message.data);
			store.setState(handleEvent(store.getState(), event));
		} catch (err) {
			console.error(err);
		}
	};
	eventSource.onopen = console.info;
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
