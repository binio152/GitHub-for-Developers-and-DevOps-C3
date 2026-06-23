import * as core from "@actions/core";
import fs from "fs";

async function run() {
  try {
    const nameToGreet = core.getInput("who-to-greet");
    const message = `Hello ${nameToGreet}`;
    core.info(message);

    const time = new Date().toTimeString();
    core.info(`Greeting at: ${time}`);

    core.setOutput("logging", `Say${message} at ${time}`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
