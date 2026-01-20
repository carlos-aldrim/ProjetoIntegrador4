export type UpdateGabaritoDTO = {
  titulo?: string;
  configuracao?: {
    quantidade_questoes: number;
    alternativas: string[];
  };
  respostas?: Record<string, string>;
};
