const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let votes = {};
let voters = new Set();

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  socket.on('vote', (data) => {
    const { tower, apartment, vote } = data;

    // Identificação única do votante
    const voterId = {tower:tower,apartment:apartment}

    if (!voters.has(voterId)) {
      voters.add(voterId);

      if (!votes[vote]) {
        votes[vote] = 0;
      }
      votes[vote]++;

      io.emit('voteCount', votes);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.get('/voters', (req, res) => {
  res.json(Array.from(voters));
});

app.get('/results', (req, res) => {
  res.json(votes);
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na url: localhost:${PORT}`);
});
