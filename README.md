# Previas We media

> Catálogo de Referências & Prompts

Aplicação web moderna, minimalista e responsiva para catálogo e organização de referências fotográficas com cópia instantânea de prompts, busca em tempo real, filtros por categoria, favoritos e painel administrativo.

---

## ⚡ Deploy na Netlify (Configuração Automática)

O projeto inclui o arquivo `netlify.toml` e `public/_redirects` pré-configurados na raiz para resolver permanentemente qualquer erro de MIME type ou tela branca no Netlify.

### Configurações Ativas no `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Se o seu repositório já está conectado na Netlify:
Basta fazer o commit e push das novas alterações no seu repositório:
```bash
git add .
git commit -m "fix: configurar build e publish dist para Netlify"
git push
```
A Netlify detectará o arquivo `netlify.toml` automaticamente, executará o comando `npm run build` e publicará a pasta `dist`.

> **Dica no painel da Netlify (se configurado manualmente):**
> Em **Site configuration > Build & deploy > Continuous deployment > Build settings**:
> - **Build command:** `npm run build`
> - **Publish directory:** `dist`

---

## 🚀 Como Publicar no GitHub Pages (Passo a Passo)

Este repositório também inclui automação via **GitHub Actions** em `.github/workflows/deploy.yml`.

### 1. Criar o repositório no GitHub
1. Acesse o [GitHub](https://github.com) e crie um novo repositório.
2. Escolha **Public** e clique em **Create repository**.

### 2. Enviar os arquivos para o GitHub
```bash
git init
git add .
git commit -m "feat: lancamento Previas We media"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
git push -u origin main
```

### 3. Ativar o GitHub Pages
1. No seu repositório no GitHub, vá em **Settings > Pages**.
2. Em **Build and deployment > Source**, escolha **GitHub Actions**.

---

## 💻 Desenvolvimento Local

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Gerar a build de produção (gera a pasta dist/)
npm run build

# 4. Pré-visualizar a build de produção
npm run preview
```

---

## 🎨 Características do Projeto

- **Identidade Visual:** Fundo preto minimalista (`#0B0B0B`), detalhes em dourado metálico (`#D4AF37`) e cartões em cinza-escuro (`#1A1A1A`).
- **Cópia Instantânea:** Botão dourado **COPIAR PROMPT** posicionado estrategicamente abaixo de cada fotografia com feedback visual (*"✓ Prompt copiado!"*).
- **Galeria Responsiva:** 4 colunas em desktops e 2 colunas em dispositivos móveis, sem cortes ou deformações nas proporções das imagens.
- **Busca & Filtros:** Pesquisa em tempo real por título, categoria e texto integral do prompt, com abas de categorias e filtro de favoritos.
- **Painel Administrativo:** Acesso protegido por PIN/senha (padrão inicial: `wemedia2026`, alterável no painel) para adicionar novas referências com links do Imgur, editar, excluir ou exportar backups em JSON.
