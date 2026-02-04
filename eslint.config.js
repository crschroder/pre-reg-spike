//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
	{
		ignores: [
			'eslint.config.js',
			'prettier.config.js',
			'tailwind.config.js',
			'test-server.js',
			'dist/**',
		],
	},
	...tanstackConfig,
	{
		languageOptions: {
			parserOptions: {
				project: './tsconfig.eslint.json',
			},
		},
		rules: {
			'@typescript-eslint/array-type': 'off',
			'@stylistic/spaced-comment': 'off',
			'import/order': 'off',
			'sort-imports': 'off',
			'import/no-duplicates': 'off',
			'import/first': 'off',
			'node/prefer-node-protocol': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/no-unnecessary-type-assertion': 'off',
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
			'@typescript-eslint/require-await': 'off',
			'no-shadow': 'off',
		},
	},
]
