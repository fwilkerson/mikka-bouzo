import Sockette from 'sockette';

import {handleEvent} from './event-handlers';

const API_URL = 'https://mikka-bouzo-poll-api-ckmhebiznl.now.sh/api';
const WS_URL = 'wss://mikka-bouzo-poll-api-ckmhebiznl.now.sh/web-socket';
const messageQueue = [];

let _ws;
let sockette;

export function connectSocket(store) {
	if (PRERENDER) return;

	sockette = new Sockette(WS_URL, {
		onopen(event) {
			while (messageQueue.length) {
				const message = messageQueue.shift();
				sockette.json(message);
			}
			_ws = event.target;
		},
		onmessage(message) {
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
		timeout: 5e3,
		maxAttempts: 3,
		onreconnect: console.info,
		onclose: console.info,
		onerror: console.error,
		onmaximum: console.info
	});
}

export function queueMessage(message) {
	if (_ws && _ws.readyState === WebSocket.OPEN) {
		sockette.json(message);
	} else {
		messageQueue.push(message);
	}
}

export function get(route) {
	return fetch(API_URL + route).then(response => response.json());
}

export function postCommand(command) {
	const options = {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify(command)
	};
	return fetch(API_URL + '/command', options).then(response => response.json());
}
