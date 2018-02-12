const API_URL = 'https://mikka-bouzo-api-tzdctwfrkk.now.sh/api';
// const API_URL = 'http://localhost:3000/api';

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
