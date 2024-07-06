const net = require("net");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function clearLine(dir = 0) {
  return new Promise((resolve, reject) => {
    process.stdout.clearLine(dir, () => {
      resolve();
    });
  });
}

async function moveCursor(dx, dy) {
  return new Promise((resolve, reject) => {
    process.stdout.moveCursor(dx, dy, () => {
      resolve();
    });
  });
}

let id;

const client = net.createConnection(
  {
    host: "127.0.0.1",
    port: 3008,
  },
  async () => {
    console.log("Connected to the server!");
    await askQuestion();
  }
);

client.on("data", async (data) => {
  console.log();
  await moveCursor(0, -1);
  await clearLine(0);
  const dataString = data.toString("utf-8");

  if (dataString.substring(0, 2) === "id") {
    // when we are getting the id
    id = dataString.substring(3);
    console.log(`Your id is ${id}!\n`);
  } else {
    // when we are getting the message
    if (
      dataString.substring(
        dataString.indexOf("User "),
        dataString.indexOf(":")
      ) === `User ${id}`
    ) {
      console.log(`> Me: ${dataString.substring(dataString.indexOf(":") + 2)}`);
    } else {
      console.log(dataString);
    }
  }

  await askQuestion();
});

client.on("close", () => {
  console.log("Connection closed!");
});

function askQuestion() {
  return new Promise((resolve) => {
    rl.question("Enter a message > ", async (message) => {
      // move the cursor one line up
      await moveCursor(0, -1);
      await clearLine(0);
      client.write(`${id}-message-${message}`);
      resolve(message);
    });
  });
}
