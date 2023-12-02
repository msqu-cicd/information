import * as core from '@actions/core';
import * as github from '@actions/github';
import * as process from 'process';
import * as semverParser from 'semver-parser';


import * as gather from './gather';

gather.gather_information(true, true);