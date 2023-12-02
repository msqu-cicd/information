import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'process';
import * as semverParser from 'semver-parser';
import {result_to_output} from './lib';

export function collect_git(debug = false, output = false) {
  const r = {
    git_is_branch        : false,
    git_is_tag           : false,
    git_is_pull_request  : false,
    git_current_branch   : false,
    git_ref_branch       : false,
    git_is_default_branch: false,
    git_tag              : false,
    semver_valid         : false,
    semver_major         : false,
    semver_minor         : false,
    semver_patch         : false,
    semver_build         : false,
    semver_pre           : false
  };

  try {
    const stripTagPrefix = core.getInput('strip_tag_prefix');

    if (debug) {
      console.log(JSON.stringify(github.context, null, 2));
    }

    r.git_is_tag          = github.context.ref.startsWith('refs/tags/');
    r.git_default_branch  = github.context.payload?.repository?.defaultBranch;
    r.git_is_pull_request = github.context.payload.pull_request != null;

    if (r.git_is_pull_request) {
      const baseRef = github.context.baseRef || process.env.BODY_REF;
      const headRef =
              github.context.payload?.pull_request?.head?.ref || process.env.HEAD_REF;
      if (debug) {
        console.log('baseRef=' + baseRef);
      }
      if (debug) {
        console.log('headRef=' + headRef);
      }
      // TODO support PR data
    }
    else if (!r.git_is_tag) {
      // regular branches
      r.git_is_branch = true;
    }

    // gather regular branch info
    if (r.git_is_branch) {
      if (!github.context.ref.startsWith('refs/heads/')) {
        throw new Error(
          'Failed to determine branch for non-PR and non-Tag action'
        );
      }
      r.git_current_branch    = github.context.ref.slice('refs/heads/'.length);
      r.git_ref_branch        = r.git_current_branch; // same as current branch for non-PR, non-Tag
      r.git_is_default_branch = r.git_current_branch == r.git_default_branch;
    }

    // parse semver for tags
    if (r.git_is_tag) {
      r.git_tag = github.context.ref.slice('refs/tags/'.length);

      const parsed = semverParser.parseSemVer(r.git_tag);
      if (debug) {
        console.log('semver=' + JSON.stringify(parsed));
      }

      if (parsed.matches) {
        r.semver_valid = parsed.matches;
        r.semver_major = parsed.major;
        r.semver_minor = parsed.minor;
        r.semver_patch = parsed.patch;
        r.semver_build = parsed.build;
        r.semver_pre   = parsed.pre;
      }
    }
    else if (r.git_is_branch) {
      const parsed = semverParser.parseSemVer(r.git_current_branch);
      if (debug) {
        console.log('semver=' + JSON.stringify(parsed));
      }

      if (parsed.matches) {
        r.semver_valid = parsed.matches;
        r.semver_major = parsed.major;
        r.semver_minor = parsed.minor;
        r.semver_patch = parsed.patch;
        r.semver_build = parsed.build;
        r.semver_pre   = parsed.pre;
      }
    }

    if (debug) {
      console.log('results for output:', JSON.stringify(r, null, 2));
    }
    if (output) {
      result_to_output(r);
    }

    return r;
  }
  catch (error) {
    console.log("partial results before error: ", JSON.stringify(r, null, 2));
    core.setFailed(error.message);
    process.exit(1);
  }
}
