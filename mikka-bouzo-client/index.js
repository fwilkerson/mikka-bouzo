import 'skeleton-css/css/normalize';
import 'skeleton-css/css/skeleton';
import './style';
import Router from 'preact-router';
import {h, Component} from 'preact';
import {Provider} from 'unistore/preact';

import CreatePoll from 'async!./routes/create-poll';
import PollResults from 'async!./routes/poll-results';
import PollVote from 'async!./routes/poll-vote';

if (module.hot) {
	require('preact/debug');
}

let store;

const interopRequire = m => m.default || m;

if (PRERENDER) {
	let createStore = interopRequire(require('stockroom/inline'));
	store = createStore(interopRequire(require('./worker')));
} else {
	let createStore = interopRequire(require('stockroom'));
	store = createStore(require('workerize-loader!./worker')());
}

export default () => (
	<Provider store={store}>
		<div id="app">
			<Router onChange={this.handleRoute}>
				<CreatePoll path="/" />
				<PollResults path="/poll/:id/results" />
				<PollVote path="/poll/:id/vote" />
			</Router>
		</div>
	</Provider>
);
