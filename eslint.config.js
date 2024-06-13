import js from "@eslint/js";
import ts from "typescript-eslint";
import prettier from "eslint-config-prettier";

import pluginTypeScriptESLint from "@typescript-eslint/eslint-plugin";
import pluginNoLoops from "eslint-plugin-no-loops";
import pluginPrettier from "eslint-plugin-prettier";

import { fixupPluginRules } from "@eslint/compat";

import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    ignores: ["**/.next/*"]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      typescript_eslint: pluginTypeScriptESLint,
      no_loops: fixupPluginRules(pluginNoLoops),
      prettier: pluginPrettier
    },
    rules: {
      "typescript_eslint/explicit-function-return-type": 2, // require explicit function return types
      "semi": ["error", "always"],   // requires semicolons at the end of statements
      "no-console": 2,               // disallow console.log() statements
      "no_loops/no-loops": 2,        // disallow for and while loops
      "no-inner-declarations": 0,    // allow functions inside of functions
      "no-trailing-spaces": "error", // disallow trailing spaces at the end of lines
      "prettier/prettier": 2,        // turn prettier warnings into errors
      "typescript_eslint/no-unused-vars": 2, // disallow unused variables

      // sort imports
      "sort-imports": ["error", {
        "ignoreCase": true,
        "ignoreDeclarationSort": false,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
        "allowSeparatedGroups": false
      }]
    },
    languageOptions: {
      parser: tsParser
    }
  },
  {
    // don't require function return types on files which return Components
    files: ["**/*.tsx"],
    rules: {
      "typescript_eslint/explicit-function-return-type": "off"
    }
  },
  {
    // don't require function return types on API routes
    files: ["**/pages/api/*"],
    rules: {
      "typescript_eslint/explicit-function-return-type": "off"
    }
  }
];