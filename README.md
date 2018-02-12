# mikka-bouzo
> A three day monk.

Code name mikka-bouzo (to motivate myself to finish the project) is one basic idea that I've been toying around with for a while now;

> Treat the web client as just another consumer.

Then I saw [stockroom](https://github.com/developit/stockroom/), a project that moves a redux like store off the main thread and into a web worker. This essentially gives us a thread for the user interface and a background thread for data processing & networking. As someone who started their career doing silverlight development, this was very exciting.



## The Web Client

A simple user interface for creating polls. Users can then vote on polls and see the live results. The ui is build with [preact](https://preactjs.com/) and uses the above mentioned stockroom for global state management. Within the stockroom worker I handle http & websocket messages, communicating them back to the UI via state updates.

The api the client uses is built with the event source pattern. So every command sent from a client (such as create or vote) eventually creates an event. A client can choose to subscribe to events for a given poll id. Once a client is subscribed to a poll, it will recieve all newly created events for that poll. It can then process those events to always have an up to date state (results) for the poll.

## The Poll API

A micro service built with [polka](https://github.com/lukeed/polka). Two http endpoints are exposed, one for posting commands, another to get all events for a given poll id. A websocket is also exposed to push new events in realtime. For demo purposes I am not persisting events, it's strictly an in memory store.