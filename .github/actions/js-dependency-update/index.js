import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = core.getInput("github-token");
    const octokit = github.getOctokit(token);

    const { owner, repo } = github.context.repo;

    const issue = github.context.payload.issue;
    if (!issue) {
      core.setFailed("No issue found in payload");
      return;
    }

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issue.number,
      body: "Thanks for opening this issue!",
    });

    core.info("Comment created successfully");
  } catch (err) {
    if (error instanceof Error) {
      core.setFailed(error.message);
      return;
    }

    core.setFailed("Unknown error");
  }
}

run();
