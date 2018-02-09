import createStore from 'stockroom/worker';

let store = createStore({
	saving: false,
	aggregateId: null,
	pollQuestion: '',
	pollResults: {},
	totalVotes: 0
});

store.registerActions(store => ({
	createPoll(state, payload) {
		fetch('https://mikka-bouzo-api-dfbcyoqfkb.now.sh/api/command', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({type: 'CREATE_POLL', payload})
		})
			.then(response => response.json())
			.then(({aggregateId}) => store.setState({saving: false, aggregateId}))
			.catch(err => console.error('worker catch hit: ', err));
		return {saving: true};
	}
}));

export default store;
