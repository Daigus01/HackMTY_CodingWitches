/**
 * @format
 */

import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';

// Simple smoke test
test('React Native is working', () => {
  const tree = ReactTestRenderer.create(<Text>Test</Text>);
  expect(tree).toBeDefined();
});

