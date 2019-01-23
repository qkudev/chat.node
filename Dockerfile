FROM node:8.12.0-alpine

WORKDIR /app
RUN yarn global add nodemon ts-node typescript

COPY . .
RUN yarn install
RUN yarn build

EXPOSE $PORT
CMD node -r dotenv/config --no-deprecation ./build/index.js
