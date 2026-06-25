import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const context = github.context;
    const action = context.eventName;
    const payload = context.payload;

    switch (action) {
      case "push": {
        core.info(
          JSON.stringify({
            Pusher: `${payload.pusher.name} <${payload.pusher.email}>`,
            "Pushed branach": `${payload.ref}`,
          }),
        );
        for (const commit of payload.commits ?? []) {
          core.info(`Commit ${commit.id}: ${commit.message}`);
        }
        break;
      }

      case "pull_request": {
        core.info(JSON.stringify(payload));
        break;
      }

      case "issue": {
        core.info(
          JSON.stringify({
            "Issue state": `${payload.state}`,
            "Issue title": `${payload.title}`,
            "Issue body": `${payload.body}`,
          }),
        );
        break;
      }
    }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
