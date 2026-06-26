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
    const baseBranch = core.getInput("base-branch", { required: true });
    const targetBranch = core.getInput("target-branch", { required: true });
    const workingDirectory = core.getInput("working-directory", {
      required: true,
    });
    const debug = core.getBooleanInput("debug");

    const execOpts = { cwd: workingDirectory };

    core.setSecret(token);
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

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

    await exec.exec("npm update", [], { ...execOpts });

    const gitStatus = await exec.getExecOutput(
      "git status -s package*.json",
      [],
      { ...execOpts },
    );

    if (gitStatus.stdout.length > 0) {
      core.info(`[js-dependencies-update]: There are updates available!`);

      // setup git config
      await exec.exec(`git config --global user.name "gh-automation"`);
      await exec.exec(
        `git config --global user.email "gh-automation@gmail.com"`,
      );

      // create new target branch
      await exec.exec(`git switch -c ${targetBranch}`, [], { ...execOpts });

      // add new package-lock.json and commit
      await exec.exec(`git add package-lock.json`, [], { ...execOpts });
      await exec.exec(`git commit -m "chore: update dependencies"`, [], {
        ...execOpts,
      });

      // push to the target branch
      await exec.exec(`git push -u ${targetBranch} --force`, [], {
        ...execOpts,
      });

      try {
        await octokit.rest.pulls.create({
          owner,
          repo,
          title: `Update NPM dependencies`,
          body: `This PR update NPM packages`,
          head: targetBranch,
          base: baseBranch,
        });
      } catch (error) {
        core.warning(
          `[js-dependency-update]: Something went srong while creating the PR`,
        );
        core.setFailed(error.message);
      }
    } else {
      core.info(`[js-dependencies-update]: There is no updates at this time`);
    }
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
