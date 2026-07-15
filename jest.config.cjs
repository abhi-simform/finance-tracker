module.exports = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      testMatch: [
        '<rootDir>/generated/tests/unit/**/*.test.ts',
        '<rootDir>/generated/tests/integration/**/*.test.ts'
      ]
    },
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
      testMatch: [
        '<rootDir>/generated/tests/components/**/*.test.tsx',
        '<rootDir>/generated/tests/pages/**/*.test.tsx'
      ],
      setupFilesAfterEnv: ['<rootDir>/generated/tests/jest.setup.ts'],
      moduleNameMapper: {
        '\\.(css|less|scss)$': 'identity-obj-proxy'
      }
    }
  ]
};
