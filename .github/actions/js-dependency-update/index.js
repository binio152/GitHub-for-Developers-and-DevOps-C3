import * as core from "@actions/core";
import * as github from "@actions/github";
async function run() {
  try {
    console.log(github.context);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
