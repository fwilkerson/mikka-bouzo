import PouchDB from 'pouchdb-core';
import PouchMemory from 'pouchdb-adapter-memory';
import HttpPouch from 'pouchdb-adapter-http';
import mapreduce from 'pouchdb-mapreduce';
import replication from 'pouchdb-replication';
import find from 'pouchdb-find';

import createWebSocketServer from './web-socket';

PouchDB.plugin(PouchMemory)
	.plugin(HttpPouch)
	.plugin(mapreduce)
	.plugin(replication)
	.plugin(find);

export default async ({app, location}) => {
	const store = new PouchDB(location);
	await store.createIndex({index: {fields: ['aggregateId']}});
	const info = await store.info();
	const webSocketServer = createWebSocketServer(app);
	return {
		append(event) {
			return store.put(event);
		},
		publish(event) {
			webSocketServer.broadcast(event);
		},
		query(options) {
			return store.find(options);
		},
		sequence: info.doc_count
	};
};
