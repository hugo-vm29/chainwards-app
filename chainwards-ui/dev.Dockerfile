FROM node:16

RUN mkdir -p app
WORKDIR /app

COPY ./package.json ./package-lock.json ./
COPY . .

RUN npm ci

EXPOSE 5173


CMD ["npm", "start"]