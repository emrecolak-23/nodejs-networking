const net = require("net");

const PORT = 3008;
const HOST = "127.0.0.1";
const server = net.createServer();

const clients = [];

server.on("connection", (socket) => {
  const clientId = clients.length + 1;
  clients.map((client) => {
    client.socket.write(`> User ${clientId} joined!`);
  });

  socket.write(`id-${clientId}`);

  socket.on("data", (data) => {
    const dataString = data.toString("utf-8");
    const id = dataString.substring(0, dataString.indexOf("-"));
    const message = dataString.substring(dataString.indexOf("-message-") + 9);
    clients.map((client) => {
      client.socket.write(`> User ${id}: ${message}`);
    });
  });

  socket.on("end", () => {
    clients.map((client) => {
      client.socket.write(`> User ${clientId} left!`);
    });
  });

  clients.push({ id: clientId.toString(), socket });
});

server.listen(PORT, HOST, () => {
  console.log("opened server on", server.address());
});
