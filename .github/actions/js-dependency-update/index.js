import * as core from "@actions/core";
import * as github from "@actions/github";
import * as exec from "@actions/exec";

const validateBranchName = (branchName) =>
  /^[a-zA-z0-9_\-\.\/]+$/.test(branchName);
const validateDirectory = (directory) =>
  /^[a-zA-z0-9_\-\.\/]+$/.test(directory);

async function setUpGit() {
  await exec.exec(`git config --global user.name "gh-automation"`);
  await exec.exec(`git config --global user.email "gh-automation@gmail.com"`);
}

function getInput() {
  const token = core.getInput("github-token", { required: true });
  const baseBranch = core.getInput("base-branch", { required: true });
  const headBranch = core.getInput("head-branch", { required: true });
  const cwd = core.getInput("working-directory", {
    required: true,
  });
  const debug = core.getBooleanInput("debug");

  return { token, baseBranch, headBranch, cwd, debug };
}

function createOctokit(token) {
  core.setSecret(token);
  const octokit = github.getOctokit(token);
  return octokit;
}

function validateBranch(base, head) {
  if (!validateBranchName(base)) {
    core.setFailed("Invalid base branch");
    return;
  }
  if (!validateBranchName(head)) {
    core.setFailed("Invalid head branch");
    return;
  }
}

function validateWorkingDirectory(workingDirectory) {
  if (!validateDirectory(workingDirectory)) {
    core.setFailed("Invalid working directory");
    return;
  }
}

const setupLogger = ({ debug, prefix } = { debug: false, prefix: "" }) => ({
  debug: (message) => {
    if (debug) {
      core.info(`DEBUG ${prefix}${prefix ? ":" : ""}${message}`);
    }
  },
  error: (message) => {
    core.error(`${prefix}${prefix ? ":" : ""}${message}`);
  },
});

async function run() {
  try {
    const { token, baseBranch, headBranch, cwd, debug } = getInput();
    const { owner, repo } = github.context.repo;
    const execOpts = { cwd };
    const logger = setupLogger({ debug, prefix: "[js-dependency-update]" });

    const octokit = createOctokit(token);

    logger.debug("Validating base branch, head branch, working directory ...");
    validateBranch(baseBranch, headBranch);
    validateWorkingDirectory(cwd);
    logger.debug(`Base branch is ${baseBranch}`);
    logger.debug(`Target branch is ${headBranch}`);
    logger.debug(`Working directory is ${cwd}`);
    logger.debug(
      "Validated base branch, head branch, working directory successfully",
    );

    logger.debug("Running update dependencies ...");
    await exec.exec("npm update", [], { ...execOpts });

    logger.debug("Checking status package-*.json ...");
    const gitStatus = await exec.getExecOutput(
      "git status -s package-*.json",
      [],
      { ...execOpts },
    );

    if (gitStatus.stdout.length > 0) {
      logger.debug(`There are updates available!`);

      // setup git config
      logger.debug(`Setting up git config ...`);
      setUpGit();

      // create new target branch
      logger.debug(`Creating new ${headBranch} branch ...`);
      await exec.exec(`git switch -c ${headBranch}`, [], { ...execOpts });

      logger.debug(`Adding package-lock.json and committing ...`);
      // add new package-lock.json and commit
      await exec.exec(`git add package-lock.json`, [], { ...execOpts });
      await exec.exec(`git commit -m "chore: update dependencies"`, [], {
        ...execOpts,
      });

      // push to the target branch
      logger.debug(
        `Pushing from ${headBranch} branch to ${baseBranch} branch ...`,
      );
      await exec.exec(`git push -u origin ${headBranch} --force`, [], {
        ...execOpts,
      });

      try {
        logger.debug("Creating Pull Request ...");
        const pr = await octokit.rest.pulls.create({
          owner,
          repo,
          title: `Update NPM dependencies`,
          body: `This PR update NPM packages`,
          head: headBranch,
          base: baseBranch,
        });
        logger.debug(`Created PR (${pr.title}: ${pr.body}) `);
      } catch (error) {
        logger.error(`Something went srong while creating the PR`);
        core.setFailed(error.message);
      }
    } else {
      logger.debug(`There is no updates at this time`);
    }
  } catch (error) {
    core.setFailed(`Error: ${error.message}`);
  }
}

run();
