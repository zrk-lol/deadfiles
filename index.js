#!/usr/bin/env node
// Trouve les fichiers JS/TS que plus aucun autre fichier n'importe.
// Made by Varhex by Ȥrk Team — https://varhex.com · MIT
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
const args = process.argv.slice(2);
const SKIP = /^(node_modules|\.git|dist|build|\.next|\.output|coverage|\.vercel)$/;
function* walk(dir = ".") { for (const n of readdirSync(dir)) { if (SKIP.test(n)) continue; const p = join(dir, n), s = statSync(p); if (s.isDirectory()) yield* walk(p); else yield { path: relative(".", p), size: s.size }; } }
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
const env = (p) => Object.fromEntries(read(p).split(/\r?\n/).map((l) => l.match(/^\s*(?:export\s+)?([A-Za-z_][\w.]*)\s*=\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const files = [...walk()].map((f) => f.path).filter((p) => /\.(m?[jt]sx?)$/.test(p) && !/\.(test|spec|d)\./.test(p));
const all = files.map(read).join("\n"); const pkg = read("package.json");
const dead = files.filter((p) => { const base = p.replace(/\.(m?[jt]sx?)$/, "").split("/").pop(); return !/^(index|main|app|server|cli|vite\.config|next\.config)$/.test(base) && !pkg.includes(p) && !new RegExp(`["'/]${base}(\\.m?[jt]sx?)?["']`).test(all); });
dead.forEach((p) => console.log("🪦 " + p)); console.log(dead.length ? `\n${dead.length} fichier(s) peut-être inutilisé(s) (vérifie avant de supprimer)` : "✅ Aucun fichier orphelin");
