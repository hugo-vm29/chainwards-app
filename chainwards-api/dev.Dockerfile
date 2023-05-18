FROM node:16

RUN mkdir -p app
WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm ci

COPY . .
# RUN npm run build

# EXPOSE 8080
# CMD ["npm", "start"]
