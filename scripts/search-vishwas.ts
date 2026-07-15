import fs from "fs";
import path from "path";

const rootDir = path.join(process.cwd(), "src");

function searchFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes("vishwas") || line.includes("विश्वास") || line.includes("விஷ்வாஸ்") || line.includes("விஸ்வாஸ்") || line.includes("విశ్వాస్") || line.includes("ವಿಶ್ವಾಸ್") || line.includes("വിശ്വാസ്") || line.includes("বিশ্বাস") || line.includes("विश्वास")) {
      console.log(`${filePath}:${idx + 1}: ${line.trim()}`);
    }
  });
}

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        searchFile(fullPath);
      }
    }
  });
}

console.log("Searching src directory for 'vishwas' or local scripts translations...");
walk(rootDir);
// Also search scripts/seed.ts
if (fs.existsSync("scripts/seed.ts")) {
  searchFile("scripts/seed.ts");
}
