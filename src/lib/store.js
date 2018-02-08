import pouch from 'pouchdb-node';
import pouchFind from 'pouchdb-find';

pouch.plugin(pouchFind);

export default async location => {
	const store = pouch(location);
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