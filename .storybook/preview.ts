import type { Preview } from '@storybook/react';
import { themes } from '@storybook/theming';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      dark: { ...themes.dark },
      light: { ...themes.light },
      current: 'light',
    },
  },
};

export default preview;
