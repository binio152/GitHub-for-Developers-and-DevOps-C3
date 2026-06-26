import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = core.getInput("github-token", {required: true});
    const octokit = github.getOctokit(token);

    const { owner, repo } = github.context.repo;

    if (github.context.eventName === "issue") {
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: github.context.payload.issue.number,
        body: "Thanks for opening this issue!",
      });
    }

    if (github.context.eventName === "push") {
      const pusher = github.context.payload.pusher.name;
      const ref = github.context.payload.ref;

      await octokit.rest.repos.createCommitStatus({
        owner,
        repo,
        sha: github.context.sha,
        state: "success",
        target_url: `https://github.com{owner}/${repo}/actions`,
        description: `Push from ${pusher}`,
        context: "Security/Pusher-Verification",
      });
    }

    core.info("Actions run successfully");
  } catch (err) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
