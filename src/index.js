import {json} from 'body-parser';
import polka from 'polka';
import WebSocket from 'ws';

import {getIndex, getPollById, getPollResultsById, postCommand} from './routes';

const {PORT = 3000, HOST = '::'} = process.env;

const app = polka()
	.use(json())
	.get('/', getIndex)
	.get('/api/poll/:aggregateId', getPollById)
	.get('/api/poll/:aggregateId/results', getPollResultsById)
	.post('/api/command', postCommand);

const wss = new WebSocket.Server({server: app.server, path: '/ws'});

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

app
	.listen(PORT, HOST)
	.then(() => console.log(`> Running on port ${PORT}`))
	.catch(console.error);
