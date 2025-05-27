
#!/bin/bash
set -e

echo -e "\033[1;36m[RUNNER]\033[0m Iniciando ambiente completo..."

# Instala dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
  echo -e "\033[1;33m[RUNNER]\033[0m Instalando dependências com npm..."
  npm install
fi

# Inicia SCSS e Vite em paralelo com saída colorida
echo -e "\033[1;36m[SCSS]\033[0m Watcher iniciado em segundo plano..."
npm run scss | sed 's/^/[SCSS] /' &

echo -e "\033[1;32m[VITE]\033[0m Servidor iniciado em segundo plano..."
npm run dev | sed 's/^/[VITE] /' &

wait
