const net = require("net");
const fs = require("fs/promises");

const server = net.createServer(() => {});

server.on("connection", async (socket) => {
  console.log("New connection");
  let fileHandle;
  let fileWriteStream;
  socket.on("data", async (data) => {
    if (!fileHandle) {
      socket.pause(); // no longer receiving data from the client

      const indexOfDivider = data.indexOf("------");
      const fileName = data.subarray(10, indexOfDivider).toString("utf-8");

      fileHandle = await fs.open(`storage/${fileName}`, "w");
      fileWriteStream = fileHandle.createWriteStream();
      fileWriteStream.write(data.subarray(indexOfDivider + 6));
      socket.resume(); // resume receiving data from the client
      fileWriteStream.on("drain", () => {
        socket.resume();
      });
    } else {
      if (!fileWriteStream.write(data)) {
        socket.pause();
      }
    }
  });

  // This end event happends when the client.js file ends the socket
  socket.on("end", () => {
    if (fileHandle) {
      fileHandle.close();
      fileHandle = undefined;
    }

    fileWriteStream = undefined;
    console.log(socket.readableEnded);
    socket.end();
    console.log(socket.readableEnded);
    console.log("Connection ended");
  });
});

server.listen(5050, "::1", () => {
  console.log("Uploader server opened on", server.address());
});
