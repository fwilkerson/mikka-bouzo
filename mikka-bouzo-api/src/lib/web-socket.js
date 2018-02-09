import WebSocket from 'ws';

const systemMessages = {
	JOIN_CHANNEL: 'JOIN_CHANNEL',
	LEAVE_CHANNEL: 'LEAVE_CHANNEL'
};

export default ({server}) => {
	const wss = new WebSocket.Server({server, path: '/ws'});
	const channels = {};
	wss.on('connection', client => {
		client.on('message', message => {
			const {type, payload} = JSON.parse(message);

			switch (type) {
				case systemMessages.JOIN_CHANNEL:
					if (!Array.isArray(channels[payload])) {
						channels[payload] = [];
					}
					if (channels[payload].indexOf(client) === -1) {
						channels[payload].push(client);
					}
					break;
				case systemMessages.LEAVE_CHANNEL:
					if (!Array.isArray(channels[payload])) {
						channels[payload] = [];
					}
					channels[payload] = channels[payload].filter(x => x !== client);
					break;
				default:
					break;
			}
		});
		client.on('error', err => {
			console.error('socket error: ', err);
		});
	});
	wss.on('error', err => {
		console.error('web socket server error: ', err);
	});
	wss.broadcast = data => {
		const {aggregateId} = data;
		if (Array.isArray(channels[aggregateId])) {
			const message = JSON.stringify(data);
			channels[aggregateId].forEach(client => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(message);
				}
			});
		}
	};

	return wss;
};
