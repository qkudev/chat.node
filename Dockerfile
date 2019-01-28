FROM node:8.12.0-alpine

WORKDIR /app
RUN yarn global add nodemon ts-node typescript

COPY . .
RUN yarn install

EXPOSE 5000
CMD nodemon
