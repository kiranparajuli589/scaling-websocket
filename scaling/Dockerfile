FROM node:16
WORKDIR /home/node/app
COPY package.json .
COPY index.js .
RUN npm install --location=global npm@latest
RUN npm install
CMD ["npm", "run", "serve"]
