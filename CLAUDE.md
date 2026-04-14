# Noiva & Dates — Claude Code Instructions

## Identidade visual
Nunca alterar a paleta de cores definida em style.css sem aprovação.
Nunca substituir Playfair Display ou Cormorant Infant por fontes 
genéricas (Arial, Inter, Roboto, system-ui).

## Regras de código
- CSS em arquivo separado (style.css), nunca inline no HTML
- JavaScript vanilla apenas — sem libs externas exceto Google Fonts
- Commits pequenos e descritivos a cada feature concluída
- Testar responsivo em 375px, 768px e 1280px antes de commitar

## Assets
- /assets/logo-completa.png — logo com fundo transparente (não redimensionar)
- /assets/logo-icone.png — ícone isolado (usar na nav e favicon)
- Fotos de produtos vão em /assets/images/ — não usar imagens de stock

## Deploy
- Plataforma: Vercel
- Branch main = produção
- Preview automático em PRs

## Formulário
- Endpoint Formspree: configurar em script.js
- Nunca commitar API keys ou endpoints reais no código — usar .env

## O que nunca fazer
- Não criar arquivos de documentação (.md extras)
- Não instalar dependências npm sem necessidade clara
- Não usar !important no CSS
- Não fazer deploy sem testar o formulário localmente