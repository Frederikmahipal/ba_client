FROM node:20

WORKDIR /client

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY . .

RUN yarn build

FROM nginx:alpine
COPY --from=0 /client/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]