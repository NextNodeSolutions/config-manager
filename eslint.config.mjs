import nextnodeEslint from '@nextnode/eslint-plugin/base'

export default [
	...nextnodeEslint,
	{
		ignores: [
			'dist/**/*', 
			'coverage/**/*',
			'src/config/__test-fixtures__/generated-types.d.ts',
			'src/config/generate-types.cjs'
		],
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.eslint.json',
			},
		},
	},
]
