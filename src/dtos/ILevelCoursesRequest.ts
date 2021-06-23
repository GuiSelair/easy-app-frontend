export default interface ILevelsCoursesRequest {
  id_nivel: number;
  id_curso: number;
  descricao: string;
  ordem: string;
  livro: string;
  livro_edicao: string;
  livro_editora: string;
  isbn: string;
  status: string;
  geracertificado: string;
  cargahoraria: string;
  iniciante: string;
  idade_final: string;
  idade_inicial: string;
  reprovaporfalta: string;
  reprovapornota: string;
  online_presencial: string;
  font_color: string;
  label_color: string;
  proximo_nivel: string;
  nivel_equivalente: string;
  nivel_equivalente2: string;
  nivel_equivalente3: string;
  nivel_equivalente4: string;
}