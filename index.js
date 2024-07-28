const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const messages = [];

function deleteMessage(timestamp) {
  const index = messages.findIndex(m => m.timestamp === timestamp);
  if (index !== -1) {
    messages.splice(index, 1);
    io.emit('delete message', timestamp);
  }
}

io.on('connection', (socket) => {
  // Send existing messages to the new client
  socket.emit('initial messages', messages);

  socket.on('chat message', (msg) => {
    const timestamp = Date.now();
    const newMessage = { text: msg, timestamp: timestamp };
    messages.push(newMessage);
    io.emit('chat message', newMessage);

    // Set a timeout to delete the message after 2 minutes
    setTimeout(() => deleteMessage(timestamp), 2 * 60 * 1000); // 2 minutes in milliseconds
  });
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});