import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";

const validateBranchName = (branchName) =>
  /^[a-zA-z0-9_\-\.\/]+$/.test(branchName);
const validateWorkingDirectory = (directory) =>
  /^[a-zA-z0-9_\-\.\/]+$/.test(directory);

async function run() {
  try {
    const token = core.getInput("github-token", { required: true });
    const baseBranch = core.getInput("base-branch");
    const targetBranch = core.getInput("target-branch");
    const workingDirectory = core.getInput("working-directory");
    const debug = core.getBooleanInput("debug");

    core.setSecret(token);

    if (!validateBranchName(baseBranch)) {
      core.setFailed("Invalid base branch");
      return;
    }
    if (!validateBranchName(targetBranch)) {
      core.setFailed("Invalid target branch");
      return;
    }
    if (!validateWorkingDirectory(workingDirectory)) {
      core.setFailed("Invalid working directory");
      return;
    }

    core.info(`[js-dependencies-update]: base branch is ${baseBranch}`);
    core.info(`[js-dependencies-update]: target branch is ${targetBranch}`);
    core.info(
      `[js-dependencies-update]: working directory is ${workingDirectory}`,
    );

    await exec.exec("npm update", [], {
      cwd: workingDirectory,
    });

    const gitStatus = await exec.getExecOutput(
      "git status -s package*.json",
      [],
      {
        cwd: workingDirectory,
      },
    );

    if (gitStatus.stdout.length > 0) {
      core.info(`[js-dependencies-update]: There are updates available!`);
    } else {
      core.indo(`[js-dependencies-update]: There is no updates at this time`);
    }

    
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
