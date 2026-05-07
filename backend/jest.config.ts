import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // Usa o tsconfig dedicado para testes (rootDir: "." em vez de "./src")
        tsconfig: "./tsconfig.test.json",
      },
    ],
  },
  moduleNameMapper: {
    // Redireciona qualquer importação de lib/prisma para o mock automático
    "lib/prisma": "<rootDir>/src/__mocks__/prisma.ts",
  },
  collectCoverageFrom: [
    "src/controllers/**/*.ts",
    "src/middlewares/**/*.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testTimeout: 10000,
};

export default config;
