const net = require("net");
const fs = require("fs/promises");
const path = require("path");

const clearLine = (dir) => {
  return new Promise((resolve) => {
    process.stdout.clearLine(dir);
    process.stdout.cursorTo(0);
    resolve();
  });
};

const moveCursor = (dx, dy) => {
  return new Promise((resolve) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
};

const socket = net.createConnection({ port: 5050, host: "::1" }, async () => {
  const filePath = process.argv.slice(-1)[0];
  const fileName = path.basename(filePath);
  const fileHandle = await fs.open(filePath, "r");
  const fileReadStream = fileHandle.createReadStream();
  const fileSize = (await fileHandle.stat()).size;

  // For showing the progress of the upload
  let uploadedPercentage = 0;
  let bytesUploaded = 0;
  socket.write(`fileName: ${fileName}------`);
  // Reading from source file and writing to the socket
  fileReadStream.on("data", async (data) => {
    if (!socket.write(data)) {
      fileReadStream.pause();
    }

    bytesUploaded += data.length; // add the number of bytes read to the variable
    let newPercentage = Math.floor((bytesUploaded / fileSize) * 100);
    if (newPercentage % 5 === 0 && newPercentage !== uploadedPercentage) {
      uploadedPercentage = newPercentage;
      await moveCursor(0, -1);
      await clearLine(0);
      console.log(`Uploading... ${uploadedPercentage}%`);
    }
  });

  socket.on("drain", () => {
    fileReadStream.resume();
  });

  fileReadStream.on("end", () => {
    console.log("File was successfully uploaded");
    socket.end();
  });
});
