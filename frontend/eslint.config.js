import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Used intentionally throughout this app's data-loading hooks
      // (useMyFavorites, useMyOrders, useMyProfile, useMyReviews,
      // useProductReviews, ProductInfoPage) - keep as a warning rather
      // than a build-blocking error.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
