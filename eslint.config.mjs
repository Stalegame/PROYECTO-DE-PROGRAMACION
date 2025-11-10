import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // 🟦 FRONTEND
  {
    files: ["src/Frontend/**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-empty": "warn",
      "quotes": ["error", "single"],
      "semi": ["error", "always"]
    }
  },

  // 🟩 BACKEND (Node.js)
  {
    files: ["src/backend/**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-empty": "warn"
    }
  },

  // 🧪 TESTS
  {
    files: ["tests/**/*.{js,mjs,cjs}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node
      },
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": "warn"
    }
  }
]);
