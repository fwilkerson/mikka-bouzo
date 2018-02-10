import PouchDB from 'pouchdb-core';
import PouchMemory from 'pouchdb-adapter-memory';
import HttpPouch from 'pouchdb-adapter-http';
import mapreduce from 'pouchdb-mapreduce';
import replication from 'pouchdb-replication';
import find from 'pouchdb-find';

PouchDB.plugin(PouchMemory)
	.plugin(HttpPouch)
	.plugin(mapreduce)
	.plugin(replication)
	.plugin(find);

export default async ({location}) => {
	const store = new PouchDB(location);
	await store.createIndex({index: {fields: ['aggregateId']}});
	const info = await store.info();
	return {
		append(event) {
			return store.put(event);
		},
		query(options) {
			return store.find(options);
		},
		sequence: info.doc_count
	};
};
