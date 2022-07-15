FROM node:16
WORKDIR /home/node/app
COPY package.json .
RUN npm install --location=global npm@latest
RUN npm install
CMD ["npm", "run", "watch"]
