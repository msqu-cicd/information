const core = require('@actions/core');
const github = require('@actions/github');
const process = require('process');

const semverParser = require('semver-parser');


try {
  // `who-to-greet` input defined in action metadata file
  const stripTaxPrefix = core.getBooleanInput('strip_tag_prefix');

  console.log(JSON.stringify(github.context.payload))
  
  const isTag = github.context.ref.startsWith("refs/tags/")
  core.setOutput("git_is_tag", isTag ? "true" : "false")

  if(!isTag) {
    const baseRef = github.context.payload?.pull_request?.base?.ref || process.env.BODY_REF
    const headRef = github.context.payload?.pull_request?.head?.ref || process.env.HEAD_REF
    console.log("baseRef="+baseRef)
    console.log("headRef="+headRef)
  }


  // const parsed = semverParser.parseSemVer("1.1.1+abc")

} catch (error) {
  core.setFailed(error.message);
}
