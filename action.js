import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'process';
import * as semverParser from 'semver-parser';


try {
  const stripTagPrefix = core.getInput('strip_tag_prefix');

  console.log(JSON.stringify(github.context))
  console.log("github.context.ref=" + github.context.ref)
  
  const isTag = github.context.ref.startsWith("refs/tags/")
  core.setOutput("git_is_tag", isTag ? "true" : "false")

  const defaultBranch = github.context.payload?.repository?.defaultBranch
  core.setOutput("git_default_branch", defaultBranch)

  const isPullRequest = github.context.payload.pull_request != null
  core.setOutput("git_is_pull_request", isPullRequest)

  if(isPullRequest) {
    const baseRef = github.context.baseRef || process.env.BODY_REF
    const headRef = github.context.payload?.pull_request?.head?.ref || process.env.HEAD_REF
    console.log("baseRef=" + baseRef)
    console.log("headRef=" + headRef)
    
  } else if(!isTag) {
    if(!github.context.ref.startsWith("refs/head/")) {
        throw new Error("Failed to determine branch for non-PR and non-Tag action")
    }
    const currentBranch = github.context.ref.slice("refs/head/".length)
    console.log("git_current_branch=" + currentBranch)
    core.setOutput("git_current_branch", currentBranch)

    const isDefaultBranch = currentBranch == defaultBranch
    console.log("git_current_branch=" + isDefaultBranch ? "true" : "false")
    core.setOutput("git_is_default_branch", isDefaultBranch ? "true" : "false")
  }

  if(isTag) {
    const tag = github.context.ref.slice("refs/tags/".length)
    console.log("git_tag=" + tag)
    core.setOutput("git_tag", tag)

    const parsed = semverParser.parseSemVer(tag)
    console.log("semver=" + JSON.stringify(parsed))

    core.setOutput("semver_valid", parsed.matches ? "true" : "false")
    core.setOutput("semver_major", parsed.major)
    core.setOutput("semver_minor", parsed.minor)
    core.setOutput("semver_patch", parsed.patch)
    core.setOutput("semver_build", parsed.build)
    core.setOutput("semver_pre", parsed.pre)
  } else {
    core.setOutput("git_tag", "false")
    core.setOutput("semver_valid", "false")
    core.setOutput("semver_major", "false")
    core.setOutput("semver_minor", "false")
    core.setOutput("semver_patch", "false")
    core.setOutput("semver_build", "false")
    core.setOutput("semver_pre", "false")
  }
  

} catch (error) {
  core.setFailed(error.message);
}
