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

COPY --from=development /app/assets ./seed-assets

ENTRYPOINT ["sh","-c","mkdir -p /app/assets && for f in img1.jpg img2.jpg; do if [ -f \"/app/seed-assets/$f\" ] && [ ! -f \"/app/assets/$f\" ]; then cp \"/app/seed-assets/$f\" \"/app/assets/$f\"; fi; done; npx prisma migrate deploy && npx prisma db seed && npm run start:prod"]