import {collect_all} from './index';
import {isTrueString} from './lib';

const debug = isTrueString(process.env['ACTIONS_STEP_DEBUG']);

collect_all(debug, true);
