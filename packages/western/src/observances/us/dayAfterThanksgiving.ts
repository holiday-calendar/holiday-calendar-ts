import { relativeObservance } from '@holiday-calendar/core';
import { thanksgiving } from './thanksgiving.js';

/**
 * Day After Thanksgiving (NYSE market closure by convention) — Thanksgiving + 1 day.
 */
export const dayAfterThanksgiving = relativeObservance(thanksgiving, 1);
