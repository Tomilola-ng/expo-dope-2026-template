import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, ".env.example");
const target = resolve(root, ".env.local");

if (existsSync(target)) {
  console.log(".env.local already exists — skipped.");
} else {
  copyFileSync(source, target);
  console.log("Created .env.local from .env.example");
  console.log("Edit EXPO_PUBLIC_API_BASE_URL before running the app.");
}
