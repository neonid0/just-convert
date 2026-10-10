// Tauri's resource copier follows symlinks, which breaks the signature of the embedded
// LibreOffice.app; engines are therefore copied in with ditto after the app is bundled.
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = (program, args) =>
  execFileSync(program, args, {
    cwd: projectRoot,
    stdio: ["ignore", "inherit", "inherit"],
  });

const config = JSON.parse(
  await readFile(resolve(projectRoot, "src-tauri/tauri.conf.json"), "utf8"),
);
const bundleDirectory = resolve(projectRoot, "src-tauri/target/release/bundle");
const app = join(bundleDirectory, "macos", `${config.productName}.app`);
const vendor = join(app, "Contents/Resources/vendor");

run("pnpm", ["tauri", "build", "--bundles", "app"]);

for (const engine of [
  "ffmpeg/bin/ffmpeg",
  "ffmpeg/bin/ffprobe",
  "qpdf/bin/qpdf",
  "qpdf/lib",
  "pdfium/bin/libpdfium.dylib",
  "libreoffice",
  "pdf-to-docx",
]) {
  await rm(join(vendor, engine), { recursive: true, force: true });
  run("ditto", [resolve(projectRoot, "vendor", engine), join(vendor, engine)]);
}

run("codesign", ["--force", "--sign", "-", app]);
run("codesign", ["--verify", "--deep", "--strict", app]);

const arch = process.arch === "arm64" ? "aarch64" : "x64";
const dmg = join(
  bundleDirectory,
  "dmg",
  `${config.productName}_${config.version}_${arch}.dmg`,
);
const stage = await mkdtemp(join(tmpdir(), "just-convert-dmg-"));
try {
  run("ditto", [app, join(stage, `${config.productName}.app`)]);
  await symlink("/Applications", join(stage, "Applications"));
  run("mkdir", ["-p", dirname(dmg)]);
  run("hdiutil", [
    "create",
    "-quiet",
    "-volname",
    config.productName,
    "-srcfolder",
    stage,
    "-format",
    "ULMO",
    "-ov",
    dmg,
  ]);
} finally {
  await rm(stage, { recursive: true, force: true });
}
console.log(`Packaged ${app}\nPackaged ${dmg}`);
