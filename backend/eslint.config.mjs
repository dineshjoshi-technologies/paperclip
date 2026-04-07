{
  "languageOptions": {
    "ecmaVersion": 2022,
    "sourceType": "commonjs"
  },
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "warn",
    "semi": ["error", "always"],
    "quotes": ["warn", "single"],
    "no-debugger": "error",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-loop-func": "warn",
    "no-return-await": "warn",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"]
  },
  "ignores": [
    "node_modules/",
    ".nyc_output/",
    "coverage/"
  ]
}
