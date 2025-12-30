import eslintPluginImport from "eslint-plugin-import";
import eslintPluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./tsconfig.eslint.json"],
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: {
      import: eslintPluginImport,
      "simple-import-sort": eslintPluginSimpleImportSort,
      "@typescript-eslint": typescriptEslint,
    },
    rules: {
      ...typescriptEslint.configs["recommended"].rules,
      ...typescriptEslint.configs["recommended-type-checked"].rules,
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: false,
        },
      ],
    },
  },
];
