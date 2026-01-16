export interface CreateGabaritoDTO {
  titulo: string;
  configuracao: {
    quantidade_questoes: number;
    alternativas: string[];
  };
  respostas: Record<string, string>;
  userId?: string;
}
