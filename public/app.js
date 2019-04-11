// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
// Use localStorage to store our login token
client.configure(feathers.authentication({
  storage: window.localStorage
}));

// Listen to created events and add the new message in real-time
client.service('messages').on('created', addMessage);
// We will also see when new users get created in real-time
client.service('users').on('created', addUser);

login();
