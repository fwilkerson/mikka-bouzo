import WebSocket from 'ws';

export default server => {
	const wss = new WebSocket.Server({server, path: '/ws'});
	wss.on('connection', socket => {
		socket.on('message', message => {
			console.info(JSON.parse(message));
		});
		socket.on('error', err => {
			console.error('socket error: ', err);
		});
	});
	wss.on('error', err => {
		console.error('web socket server error: ', err);
	});
	wss.broadcast = data => {
		wss.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(data);
			}
		});
	};

	return wss;
};
