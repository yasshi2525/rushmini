FROM node:14

COPY . .

RUN npm install -g @akashic/akashic-cli && \
    npm install && \
    npm run build

ENTRYPOINT [ "npm", "start" ]