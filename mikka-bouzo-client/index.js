import 'skeleton-css/css/normalize';
import 'skeleton-css/css/skeleton';
import './style';
import Router from 'preact-router';
import {h, Component} from 'preact';
import {Provider} from 'unistore/preact';

import CreatePoll from 'async!./routes/create-poll';
import PollResults from 'async!./routes/poll-results';

if (module.hot) {
	require('preact/debug');
}

// let store = createStore(new StoreWorker());

let store;

const interopRequire = m => m.default || m;

// This is an example of skipping the Worker entirely during SSR/Prerendering:
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
			</Router>
		</div>
	</Provider>
);
