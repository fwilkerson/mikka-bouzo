import PouchDB from 'pouchdb-core';
import PouchMemory from 'pouchdb-adapter-memory';
import HttpPouch from 'pouchdb-adapter-http';
import mapreduce from 'pouchdb-mapreduce';
import replication from 'pouchdb-replication';
import find from 'pouchdb-find';
import WebSocket from 'ws';

import {socketMessages} from '../../mikka-bouzo-common/constants';

PouchDB.plugin(PouchMemory)
	.plugin(HttpPouch)
	.plugin(mapreduce)
	.plugin(replication)
	.plugin(find);

export default async ({server}) => {
	const store = new PouchDB('event-store');
	await store.createIndex({index: {fields: ['aggregateId']}});
	const wss = new WebSocket.Server({server, path: '/web-socket'});

	wss.on('connection', client => {
		client.on('message', message => {
			const event = JSON.parse(message);
			if (event.type === socketMessages.SUBSCRIBE) {
				client.aggregateId = event.aggregateId;
			}
		});
		client.on('error', () => {});
	});

	return {
		append(event) {
			return store.put(event);
		},
		getById(id) {
			return store.get(id);
		},
		query(options) {
			return store.find(options);
		},
		publish(event) {
			const message = JSON.stringify(event);
			wss.clients.forEach(client => {
				if (
					client.aggregateId === event.aggregateId &&
					client.readyState === WebSocket.OPEN
				) {
					client.send(message);
				}
			});
		}
	};
};
