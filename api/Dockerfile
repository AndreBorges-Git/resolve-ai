FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# O errorHandler usa NODE_ENV para decidir se a resposta de 500 sai generica.
# Sem isto a imagem de producao devolveria a mensagem interna ao cliente.
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/main/server.js"]
