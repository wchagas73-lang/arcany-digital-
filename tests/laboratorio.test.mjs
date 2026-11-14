import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("testing laboratory uses clearly labeled demo-only records", async () => {
  const page = await read("../src/app/laboratorio/page.tsx");
  assert.match(page, /\[DEMO\] Café Horizonte/);
  assert.match(page, /\[DEMO\] Pet Amigo/);
  assert.match(page, /DADO FICTÍCIO PARA TESTES/);
  assert.match(page, /Não contatar/);
});

test("demo reset removes only records with the Arcany demo prefix", async () => {
  const page = await read("../src/app/laboratorio/page.tsx");
  assert.match(page, /item\.id\.startsWith\(prefix\)/);
  assert.match(page, /companies\.filter\(item => !item\.id\.startsWith\(prefix\)\)/);
  assert.match(page, /leads\.filter\(item => !item\.id\.startsWith\(prefix\)\)/);
});

test("testing laboratory is reachable from the private workspace navigation", async () => {
  const shell = await read("../src/components/app-shell.tsx");
  assert.match(shell, /href: "\/laboratorio"/);
});
