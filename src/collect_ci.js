import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'process';
import {result_to_output} from './lib';

export function collect_ci(debug = false, output = false) {
  const r = {
    ci_hostname: false
  };

  try {
    const url     = new URL(github.context.serverUrl);
    r.ci_hostname = url.hostname;

    if (debug) {
      console.log('results for collect_ci:', JSON.stringify(r, null, 2));
    }
    if (output) {
      result_to_output(r);
    }

    return r;
  }
  catch (error) {
    console.log('partial results for collect_ci before error: ', JSON.stringify(r, null, 2));
    core.setFailed(error.message);
    process.exit(1);
  }
}
