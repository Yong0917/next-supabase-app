import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  // 검사에서 제외할 파일/디렉토리
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },

  // Next.js 기본 규칙 (core-web-vitals + TypeScript)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 프로젝트 공통 커스텀 규칙
  {
    rules: {
      // 사용하지 않는 변수 경고 (언더스코어 prefix 허용)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // console.log 경고 (warn, error는 허용)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  // 설정 파일 규칙 완화 (require() 허용)
  {
    files: ["*.config.ts", "*.config.mjs", "*.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // shadcn/ui 자동 생성 컴포넌트 규칙 완화
  {
    files: ["components/ui/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/display-name": "off",
    },
  },

  // Prettier와 충돌하는 ESLint 규칙 비활성화 (반드시 마지막에 배치)
  eslintConfigPrettier,
];

export default eslintConfig;
