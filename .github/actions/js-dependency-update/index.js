import * as core from "@actions/core";
import * as github from "@actions/github";
async function run() {
  try {
    console.log(`SHA: ${github.context.sha}`);
    console.log(`Branch: ${github.context.ref}`);
    console.log(`Trigger event: ${github.context.eventName}`);
    console.log(`Trigger user: ${github.context.actor}`);
    console.log(`Workflow name: ${github.context.workflow}`);
    console.log(`Repo owner: ${github.context.repo.owner}`);
    console.log(`Job name: ${github.context.job}`);
    console.log(`Payload: ${github.context.payload}`);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
