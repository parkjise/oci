import { defineConfig, loadEnv, type ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "url";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * .env.local 파일에서 VITE_ 접두사로 시작하는 환경변수 로드
 */
function loadLocalEnv(): Record<string, string> {
  const localEnvPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(localEnvPath)) {
    return {};
  }

  const localEnv: Record<string, string> = {};
  const content = readFileSync(localEnvPath, "utf-8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const equalIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, equalIndex).trim();
    const value = trimmed
      .slice(equalIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (key.startsWith("VITE_")) {
      localEnv[key] = value;
    }
  }

  return localEnv;
}

export default defineConfig(({ mode }: ConfigEnv) => {
  // 환경변수 로드: .env.local이 .env.[mode]보다 우선순위가 높도록 처리
  const modeEnv = loadEnv(mode, process.cwd(), "VITE_");
  const localEnv = loadLocalEnv();
  const env = { ...modeEnv, ...localEnv };

  // 런타임 환경변수를 define으로 설정하여 .env.local이 최우선이 되도록 보장
  const define = Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      `import.meta.env.${key}`,
      JSON.stringify(value),
    ])
  );

  return {
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
    define,
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "http://222.106.252.150:8081",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
        "@components": fileURLToPath(
          new URL("./src/components", import.meta.url)
        ),
        "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
        "@store": fileURLToPath(new URL("./src/store", import.meta.url)),
        "@apis": fileURLToPath(new URL("./src/apis", import.meta.url)),
        "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
        "@config": fileURLToPath(new URL("./src/config", import.meta.url)),
        "@constants": fileURLToPath(
          new URL("./src/constants", import.meta.url)
        ),
        "@form": fileURLToPath(
          new URL("./src/components/ui/form", import.meta.url)
        ),
        "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "/src/assets/styles/variables.scss" as *;`,
        },
      },
    },
  };
});
