import * as core from '@actions/core';
import {collect_all} from './index';
import {isTrueString} from './lib';

const debug = isTrueString(process.env['ACTIONS_STEP_DEBUG']);

try {
  collect_all(debug, true);
}
catch (error) {
  core.setFailed(error instanceof Error ? error.message : String(error));
}
