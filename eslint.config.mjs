import next from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['node_modules/**', '.next/**', 'legacy/**', 'scripts/**', 'public/**', '*.config.*', 'next-env.d.ts'] },
  ...tseslint.configs.recommended,
  {
    plugins: { '@next/next': next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
];
