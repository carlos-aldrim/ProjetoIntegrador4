import { execFile } from "child_process";
import path from "path";

export function runOMR(imagePath: string): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve("python/omr.py");

    execFile(
      "python",
      [scriptPath, imagePath],
      (error, stdout, stderr) => {
        if (error) {
          return reject(stderr || error.message);
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch {
          reject("Erro ao interpretar resposta do OMR");
        }
      }
    );
  });
}
