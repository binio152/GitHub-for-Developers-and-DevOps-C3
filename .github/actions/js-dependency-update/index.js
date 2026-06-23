import * as core from "@actions/core";
import fs from "fs";

async function run() {
  const nameToGreet = process.env["INPUT_WHO_TO_GREET"];
  const message = `Hello ${nameToGreet}`;
  console.log(message);

  const time = new Date().toTimeString();
  console.log(`Greeting at: ${time}`);

  fs.appendFile(
    process.env.GITHUB_OUTPUT,
    `logging=Say${message} at ${time}\n`,
  );
}

run();
