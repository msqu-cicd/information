import * as core from '@actions/core';

export function result_to_output(results) {
  for (const key in results) {
    if (!results.hasOwnProperty(key)) {
      continue;
    }
    const value = results[key];
    if (typeof value !== 'string') {
      core.setOutput(key, JSON.stringify(value)); // TODO support nested objects with key chaining
    }
    else {
      core.setOutput(key, value);
    }
  }
}
