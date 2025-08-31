import js from '@eslint/js';
import globals from 'globals';
import mochaPlugin from 'eslint-plugin-mocha';
import nodePlugin from 'eslint-plugin-n';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: ['frontend/dist'],
  },

  js.configs.recommended,
  mochaPlugin.configs.recommended,
  nodePlugin.configs['flat/recommended'],
  prettierPlugin,

  // components
  {
    files: ['frontend/components/**'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ungit: 'readonly',
      },
    },

    rules: {
      'n/no-missing-require': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },

  // public/source
  {
    files: ['frontend/source/js/**'],

    languageOptions: {
      globals: {
        ...globals.browser,
        io: 'readonly',
        jQuery: 'writable',
        ungit: 'readonly',
      },
    },

    rules: {
      'n/no-missing-require': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },

  // source
  {
    files: ['backend/source/**'],

    rules: {
      'no-control-regex': 'off',
      'n/no-process-exit': 'off',
    },
  },

  // test
  {
    files: ['tests/unittests/**'],

    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },

    rules: {
      'mocha/no-mocha-arrows': 'off',
    },
  },

  // clicktests
  {
    files: ['tests/clicktests/**'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ungit: 'readonly',
      },
    },

    rules: {
      'mocha/no-mocha-arrows': 'off',
      'mocha/no-setup-in-describe': 'off',
    },
  },

  // eslint.config.mjs
  {
    files: ['eslint.config.mjs'],

    languageOptions: {
      sourceType: 'module',
    },
  },
];
