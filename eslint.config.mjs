import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/globals': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-render': 'warn',
      'react-hooks/config': 'warn',
      'react-hooks/gating': 'warn',
      'react-hooks/error-boundaries': 'warn',
      '@next/next/no-img-element': 'warn',
      'import/no-anonymous-default-export': 'off',
    },
  },
  {
    ignores: [
      '.next/**',
      '.next-dev/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'next-env.d.ts',
      'tests/**',
    ],
  },
];

export default config;
