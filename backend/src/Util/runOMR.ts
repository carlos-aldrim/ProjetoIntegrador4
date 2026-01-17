import { execFile } from "child_process";
import path from "path";

export interface OMRConfig {
  quantidadeQuestoes: number;
  alternativas: string[];
}

export function runOMR(
  imagePath: string,
  config: OMRConfig
): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    if (!imagePath) {
      return reject("Caminho da imagem não informado.");
    }

    if (
      !config ||
      typeof config.quantidadeQuestoes !== "number" ||
      !Array.isArray(config.alternativas)
    ) {
      return reject("Configuração do OMR inválida.");
    }

    const scriptPath = path.resolve(
      __dirname,
      "../../python/omr.py"
    );

    const pythonConfig = JSON.stringify({
      quantidade_questoes: config.quantidadeQuestoes,
      alternativas: config.alternativas,
    });

    execFile(
      "python",
      [scriptPath, imagePath, pythonConfig],
      {
        encoding: "utf-8",
        timeout: 60_000, // 60s de segurança
        maxBuffer: 1024 * 1024, // 1MB
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error("Erro ao executar OMR:", stderr || error.message);
          return reject("Erro ao processar a imagem da prova.");
        }

        let parsed;
        try {
          parsed = JSON.parse(stdout);
        } catch {
          console.error("OMR stdout inválido:", stdout);
          return reject("Resposta inválida do sistema de leitura óptica.");
        }

        if (parsed?.error) {
          return reject(parsed.error);
        }

        if (typeof parsed !== "object") {
          return reject("Formato de resposta do OMR inválido.");
        }

        resolve(parsed as Record<string, string>);
      }
    );
  });
}
