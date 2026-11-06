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
    git_is_default_branch: false,
    git_current_branch   : '',
    git_ref_branch       : '',
    git_base_ref_branch  : '',
    git_head_ref_branch  : '',
    git_default_branch   : '',
    git_tag              : '',
    semver_valid         : false,
    semver_major         : '',
    semver_minor         : '',
    semver_patch         : '',
    semver_build         : '',
    semver_pre           : ''
  };

  try {
    const stripTagPrefix = core.getInput('strip_tag_prefix');

    r.git_is_tag          = github.context.ref.startsWith('refs/tags/');
    r.git_default_branch  = github.context.payload?.repository?.default_branch || '';
    r.git_is_pull_request = github.context.payload.pull_request != null;

    if (r.git_is_pull_request) {
      r.git_base_ref_branch = github.context.payload?.pull_request?.base?.ref
        || process.env.GITHUB_BASE_REF
        || '';
      r.git_head_ref_branch = github.context.payload?.pull_request?.head?.ref
        || process.env.GITHUB_HEAD_REF
        || '';
      r.git_current_branch  = r.git_head_ref_branch;
      r.git_ref_branch      = github.context.ref
        .replace(/^refs\/pull\//, '')
        .replace(/^refs\/heads\//, '');
      if (debug) {
        console.log('baseRef=' + r.git_base_ref_branch);
        console.log('headRef=' + r.git_head_ref_branch);
      }
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
      r.git_current_branch = github.context.ref.slice('refs/heads/'.length);
      r.git_ref_branch     = r.git_current_branch; // same as current branch for non-PR, non-Tag
    }

    r.git_is_default_branch = r.git_current_branch !== ''
      && r.git_current_branch === r.git_default_branch;

    // strip the configured prefix from tags
    if (r.git_is_tag) {
      r.git_tag = github.context.ref.slice('refs/tags/'.length);
      if (stripTagPrefix && r.git_tag.startsWith(stripTagPrefix)) {
        r.git_tag = r.git_tag.slice(stripTagPrefix.length);
      }
    }

    // parse semver from the (stripped) tag, or from the branch name otherwise
    const semverSource = r.git_tag || r.git_current_branch;
    if (semverSource) {
      const parsed = semverParser.parseSemVer(semverSource);
      if (debug) {
        console.log('semver=' + JSON.stringify(parsed));
      }

      if (parsed.matches) {
        r.semver_valid = parsed.matches;
        r.semver_major = parsed.major;
        r.semver_minor = parsed.minor;
        r.semver_patch = parsed.patch;
        r.semver_build = Array.isArray(parsed.build) ? parsed.build.join('.') : '';
        r.semver_pre   = Array.isArray(parsed.pre) ? parsed.pre.join('.') : '';
      }
    }

    if (debug) {
      console.log('results for collect_git:', JSON.stringify(r, null, 2));
    }
    if (output) {
      result_to_output(r);
    }

    return r;
  }
  catch (error) {
    console.log('partial results for collect_git before error: ', JSON.stringify(r, null, 2));
    throw error;
  }
}
