FROM public.ecr.aws/docker/library/node:22-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM public.ecr.aws/nginx/nginx:alpine AS production

WORKDIR /usr/share/nginx/html

COPY --from=development /app/dist .

CMD [ "nginx", "-g", "daemon off;" ]