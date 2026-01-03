export interface CreateAnswerKeyDTO {
  title: string;
  answers: Record<string, string>;
  userId: string;
}
