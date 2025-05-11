FROM node:18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG API_URL

RUN npm run build --prod

FROM nginx:alpine

COPY --from=build /app/dist/dash/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 81

LABEL image="monitoring-dashboard"

CMD ["nginx", "-g", "daemon off;"]