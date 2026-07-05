import test from 'node:test';
import assert from 'node:assert/strict';

import { mergeMentorshipGoals, parseGoalsToChips } from '../src/lib/onboarding';

test('parseGoalsToChips splits saved goals into chips', () => {
  assert.deepEqual(parseGoalsToChips('Career Guidance; Resume Review'), ['Career Guidance', 'Resume Review']);
  assert.deepEqual(parseGoalsToChips(''), []);
});

test('mergeMentorshipGoals joins the currently selected goals in a stable order', () => {
  assert.equal(mergeMentorshipGoals(['Resume Review', 'Mock Interviews', 'Career Guidance']), 'Resume Review; Mock Interviews; Career Guidance');
  assert.equal(mergeMentorshipGoals([]), '');
});
