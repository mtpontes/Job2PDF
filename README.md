# Job2PDF

Job2PDF é uma extensão para Google Chrome que captura os detalhes de uma vaga de emprego no LinkedIn e gera um arquivo PDF automaticamente. O objetivo é facilitar o registro e a organização das vagas para as quais você se candidatou.

## Como usar
1. **Navegue**: Acesse uma página de vaga de emprego no LinkedIn.
2. **Geração Automática**: Ao clicar no botão "Candidatar-se" (ou "Apply"), a extensão captura os dados da vaga e inicia o download do PDF automaticamente.
3. **Geração Manual**: Caso prefira, clique no ícone da extensão na barra de ferramentas do navegador para forçar a geração do PDF.

## Funcionalidades
- Extração de dados da vaga: Empresa, Cargo, Descrição, Localização e Modelo de Trabalho.
- Geração de arquivo PDF formatado com os detalhes da vaga.
- Nomeação automática do arquivo para fácil organização.

## Instalação
Para usar a versão de desenvolvimento:
1. Faça o build do projeto com `npm run build`
2. Acesse `chrome://extensions/` no seu navegador.
3. Ative o "Modo do desenvolvedor" no canto superior direito.
4. Clique em "Carregar sem compactação" e selecione a pasta `dist`.
