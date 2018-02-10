import PouchDB from 'pouchdb-core';
import PouchMemory from 'pouchdb-adapter-memory';
import HttpPouch from 'pouchdb-adapter-http';
import mapreduce from 'pouchdb-mapreduce';
import replication from 'pouchdb-replication';
import find from 'pouchdb-find';
import WebSocket from 'ws';

PouchDB.plugin(PouchMemory)
	.plugin(HttpPouch)
	.plugin(mapreduce)
	.plugin(replication)
	.plugin(find);

export default async ({app, location}) => {
	const store = new PouchDB(location);
	await store.createIndex({index: {fields: ['aggregateId']}});
	const wss = new WebSocket.Server({server: app.server, path: '/web-socket'});

	wss.on('connection', ws => {
		ws.on('error', () => {});
	});

	return {
		append(event) {
			return store.put(event);
		},
		query(options) {
			return store.find(options);
		},
		publish(event) {
			const message = JSON.stringify(event);
			wss.clients.forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(message);
				}
			});
		}
	};
};
