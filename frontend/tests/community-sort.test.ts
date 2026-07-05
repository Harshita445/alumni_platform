import test from 'node:test';
import assert from 'node:assert/strict';

import { sortCommunityPosts, type CommunityPost } from '../src/lib/community';

const basePosts: CommunityPost[] = [
  {
    id: 1,
    title: 'Oldest',
    content: 'First',
    type: 'Question',
    category: 'Software Engineering',
    authorName: 'A',
    authorRole: 'student',
    createdAt: '2 days ago',
    comments: [],
    reactions: { Helpful: 2, Useful: 1, Celebrate: 0, Insightful: 0 },
    repliesCount: 1,
    viewCount: 20,
  },
  {
    id: 2,
    title: 'Newest',
    content: 'Second',
    type: 'Discussion',
    category: 'Career Guidance',
    authorName: 'B',
    authorRole: 'alumni',
    createdAt: '1 hour ago',
    comments: [{ id: 10, authorName: 'C', role: 'student', content: 'Hi', createdAt: 'just now' }],
    reactions: { Helpful: 10, Useful: 4, Celebrate: 1, Insightful: 2 },
    repliesCount: 4,
    viewCount: 100,
  },
];

test('sortCommunityPosts orders newest content first for latest and newest views', () => {
  const latest = sortCommunityPosts(basePosts, 'Latest');
  const newest = sortCommunityPosts(basePosts, 'Newest');

  assert.deepEqual(latest.map((post) => post.id), [2, 1]);
  assert.deepEqual(newest.map((post) => post.id), [2, 1]);
});

test('sortCommunityPosts supports oldest and most liked ordering', () => {
  const oldest = sortCommunityPosts(basePosts, 'Oldest');
  const mostLiked = sortCommunityPosts(basePosts, 'Most Liked');

  assert.deepEqual(oldest.map((post) => post.id), [1, 2]);
  assert.deepEqual(mostLiked.map((post) => post.id), [2, 1]);
});
