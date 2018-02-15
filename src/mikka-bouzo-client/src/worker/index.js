import createStore from 'stockroom/worker';

import actions from './actions';
import {connectSocket} from './data-service';

const store = createStore({
	busy: false,
	aggregateId: null,
	pollQuestion: '',
	pollOptions: [],
	pollResults: {},
	totalVotes: 0
});
store.registerActions(actions);
export default connectSocket(store);
