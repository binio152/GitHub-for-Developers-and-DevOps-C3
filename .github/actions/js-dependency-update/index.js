import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const context = github.context;
    // const action = context.eventName;
    // const payload = context.payload;

    core.info(JSON.stringify(context, null, 2));

    // switch (action) {
    //   case action === "push":
    //     core.info(
    //       JSON.stringify({
    //         Pusher: `${payload.pusher.name} <${payload.pusher.email}>`,
    //         "Pushed branch": `${payload.ref}`,
    //       }),
    //     );
    //     for (const commit of payload.commits ?? []) {
    //       core.info(`Commit ${commit.id}: ${commit.message}`);
    //     }
    //     break;

    //   case "pull_request":
    //     core.info(JSON.stringify(payload));
    //     break;

    //   case "issue":
    //     core.info(
    //       JSON.stringify({
    //         "Issue state": `${payload.issue.state}`,
    //         "Issue title": `${payload.issue.title}`,
    //         "Issue body": `${payload.issue.body}`,
    //       }),
    //     );

    //     for (const label of payload.issue.labels ?? []) {
    //       core.info(label);
    //     }
    //     break;
    // }
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
