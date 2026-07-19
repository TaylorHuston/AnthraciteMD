import type { Preview } from '@storybook/react-vite'
import { initialize, mswLoader } from 'msw-storybook-addon'
import '../src/styles.css'

initialize({ onUnhandledRequest: 'error' })

const preview: Preview = {
  loaders: [mswLoader],
  parameters: { layout: 'fullscreen', a11y: { test: 'error' } },
}

export default preview
