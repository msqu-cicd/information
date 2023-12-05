import * as github from '@actions/github';
import {collect_ci} from './collect_ci';
import {collect_git} from './collect_git';

export {result_to_output} from './lib';
export {collect_git} from './collect_git';
export {collect_ci} from './collect_ci';

export function collect_all(debug = false, output = false) {

  if (debug) {
    console.log(JSON.stringify(github.context, null, 2));
  }

  return {
    ...collect_ci(debug, output),
    ...collect_git(debug, output)
  };
}

