module.exports = {
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        diagnostics: false,
      },
    ],
  },
  setupFiles: ["./jest.setup.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  testEnvironment: "node",
};
