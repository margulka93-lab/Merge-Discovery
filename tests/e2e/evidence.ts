import { test } from '@playwright/test';
import { basename, dirname } from 'node:path';
import { mkdirSync } from 'node:fs';
/** Regression captures belong to this run, never overwrite historical tracked PNGs. */
export function regressionScreenshotPath(historicalPath: string) {
  const path = test.info().outputPath(basename(historicalPath));
  mkdirSync(dirname(path),{recursive:true});
  return path;
}
