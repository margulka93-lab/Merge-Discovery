import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': hooks },
    rules: { ...hooks.configs.recommended.rules },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: ['react', 'react-dom', '**/content/**', '**/application/**', '**/persistence/**', '**/platform/**', '**/ui/**'],
      }],
      'no-restricted-globals': ['error', 'window', 'document', 'navigator', 'indexedDB', 'fetch', 'localStorage', 'Date'],
      'no-restricted-properties': ['error', { object: 'Math', property: 'random', message: 'Domain outcomes must be deterministic.' }],
    },
  },
);
