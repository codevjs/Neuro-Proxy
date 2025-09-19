const { defineConfig } = require("eslint-define-config");
const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");

module.exports = defineConfig([
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Node.js globals
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        global: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        crypto: "readonly",

        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        fetch: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Response: "readonly",
        Request: "readonly",
        Headers: "readonly",
        Blob: "readonly",
        File: "readonly",
        FormData: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        ReadableStream: "readonly",
        WritableStream: "readonly",

        // Web APIs
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        Event: "readonly",
        EventTarget: "readonly",
        HTMLElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLButtonElement: "readonly",
        SVGElement: "readonly",
        SVGSVGElement: "readonly",

        // TypeScript/React
        React: "readonly",
        JSX: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      "react": require("eslint-plugin-react"),
      "react-hooks": require("eslint-plugin-react-hooks"),
      "jsx-a11y": require("eslint-plugin-jsx-a11y"),
      "import": require("eslint-plugin-import"),
      "unused-imports": require("eslint-plugin-unused-imports"),
      "prettier": require("eslint-plugin-prettier"),
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Core rules
      "no-console": "warn",
      "no-unused-vars": "off",
      "no-case-declarations": "warn",
      "no-useless-catch": "warn",

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          ignoreRestSiblings: false,
          argsIgnorePattern: "^_.*?$"
        }
      ],

      // React rules
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/self-closing-comp": "warn",
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true
        }
      ],

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",

      // Accessibility rules
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",

      // Import rules
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": "off",
      "import/order": [
        "warn",
        {
          groups: [
            "type",
            "builtin",
            "object",
            "external",
            "internal",
            "parent",
            "sibling",
            "index"
          ],
          pathGroups: [
            {
              pattern: "~/**",
              group: "external",
              position: "after"
            }
          ],
          "newlines-between": "always"
        }
      ],

      // Code style rules
      "padding-line-between-statements": [
        "warn",
        {"blankLine": "always", "prev": "*", "next": "return"},
        {"blankLine": "always", "prev": ["const", "let", "var"], "next": "*"},
        {
          "blankLine": "any",
          "prev": ["const", "let", "var"],
          "next": ["const", "let", "var"]
        }
      ],

      // Prettier rules
      "prettier/prettier": "warn"
    },
  },
  {
    ignores: [
      ".now/*",
      "*.css",
      ".changeset",
      "dist",
      "esm/*",
      "public/*",
      "tests/*",
      "scripts/*",
      "*.config.js",
      ".DS_Store",
      "node_modules",
      "coverage",
      ".next",
      "build",
    ]
  }
]);