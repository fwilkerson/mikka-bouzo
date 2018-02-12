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

export default function handleEvent(state, event) {
	return eventHandlers[event.type]
		? eventHandlers[event.type](state, event)
		: state;
}
