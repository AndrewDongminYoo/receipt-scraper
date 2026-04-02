/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import App from '../App';
import { RootStack } from '../src/navigation/RootNavigator';

const RootStackComponent = RootStack.getComponent();

const renderApp = async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });

  return renderer;
};

const renderNavigator = async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <NavigationContainer>
        <RootStackComponent />
      </NavigationContainer>,
    );
  });

  return renderer;
};

const pressButton = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  testID: string,
) => {
  await ReactTestRenderer.act(async () => {
    renderer.root.findByProps({ testID }).props.onPress();
  });
};

test('App renders without crashing with the Day 1 navigator mounted', async () => {
  const renderer = await renderApp();

  expect(renderer).toBeTruthy();
  renderer.unmount();
});

test('renders the Home screen with all Day 1 navigation buttons', async () => {
  const renderer = await renderNavigator();

  expect(renderer.root.findByProps({ testID: 'screen-home' })).toBeTruthy();
  expect(
    renderer.root.findByProps({ testID: 'screen-home-title' }).props.children,
  ).toBe('Home');
  expect(
    renderer.root.findByProps({ testID: 'nav-receipt-upload' }),
  ).toBeTruthy();
  expect(
    renderer.root.findByProps({ testID: 'nav-receipt-list' }),
  ).toBeTruthy();
  expect(renderer.root.findByProps({ testID: 'nav-survey' })).toBeTruthy();
  expect(
    renderer.root.findByProps({ testID: 'nav-reward-result' }),
  ).toBeTruthy();
  renderer.unmount();
});

test.each([
  [
    'nav-receipt-upload',
    'screen-receipt-upload',
    'screen-receipt-upload-title',
    'Upload Receipt',
  ],
  [
    'nav-receipt-list',
    'screen-receipt-list',
    'screen-receipt-list-title',
    'Receipt List',
  ],
  ['nav-survey', 'screen-survey', 'screen-survey-title', 'Survey'],
  [
    'nav-reward-result',
    'screen-reward-result',
    'screen-reward-result-title',
    'Reward Result',
  ],
])(
  'navigates from Home using %s',
  async (buttonTestID, screenTestID, titleTestID, expectedTitle) => {
    const renderer = await renderNavigator();

    await pressButton(renderer, buttonTestID);

    expect(renderer.root.findByProps({ testID: screenTestID })).toBeTruthy();
    expect(
      renderer.root.findByProps({ testID: titleTestID }).props.children,
    ).toBe(expectedTitle);
    renderer.unmount();
  },
);
