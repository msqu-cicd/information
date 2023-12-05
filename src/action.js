import {collect_all} from './index';

const debug = process.env['ACTIONS_STEP_DEBUG'] === '1' || process.env['ACTIONS_STEP_DEBUG'] === 'true';

collect_all(debug, true);
