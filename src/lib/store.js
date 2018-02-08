import pouch from 'pouchdb-node';
import pouchFind from 'pouchdb-find';

import createWebSocketServer from './web-socket';

pouch.plugin(pouchFind);

export default async ({app, location}) => {
	const store = pouch(location);
	await store.createIndex({index: {fields: ['aggregateId']}});
	const info = await store.info();
	const webSocketServer = createWebSocketServer(app);
	return {
		append(event) {
			return store.put(event);
		},
		query(options) {
			return store.find(options);
		},
		sequence: info.doc_count,
		publish(event) {
			webSocketServer.broadcast(event);
		}
	};
};
