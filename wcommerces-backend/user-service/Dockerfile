FROM public.ecr.aws/docker/library/node:22-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

FROM public.ecr.aws/docker/library/node:22-alpine AS production

WORKDIR /app

COPY --from=development /app/dist ./dist

COPY --from=development /app/node_modules ./node_modules

COPY --from=development /app/prisma ./prisma

COPY --from=development /app/package.json ./

COPY --from=development /app/package-lock.json ./

ENTRYPOINT [ "sh", "-c", "npx prisma migrate deploy && npm run start:prod" ]