module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-prettier"],
  customSyntax: "postcss-scss",
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["function", "if", "each", "include", "mixin"],
      },
    ],
  },
  ignoreFiles: ["build/**/*.css"],
};
