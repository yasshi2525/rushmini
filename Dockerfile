FROM node:13

COPY . .

RUN npm install -g @akashic/akashic-cli && \
    npm install && \
    npm run build

ENTRYPOINT [ "npm", "start", "serve" ]