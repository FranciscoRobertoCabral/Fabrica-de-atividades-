
export type Level = 'Educação Infantil' | '1º Ano' | '2º Ano' | '3º Ano' | '4º Ano' | '5º Ano';

export type ActivityType = 
  | 'Alfabetização' 
  | 'Matemática' 
  | 'Coordenação motora' 
  | 'Cores e formas' 
  | 'Leitura e interpretação' 
  | 'Jogos pedagógicos';

export interface ActivityConfig {
  level: Level;
  type: ActivityType;
  theme: string;
  pages: number;
}

export interface ActivityData {
  title: string;
  instruction: string;
  content: string;
}
