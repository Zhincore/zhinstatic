# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app
RUN apt update && apt install -y ffmpeg libjemalloc2 && apt clean

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
WORKDIR /tmp/dev
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM node:18 AS prerelease

ARG ZSTATIC_PATH="/var/www/"
ENV ZSTATIC_PATH=$ZSTATIC_PATH

WORKDIR /usr/src/app
COPY --from=install /tmp/dev/node_modules node_modules
COPY . .

# Build project
RUN npx prisma db push
RUN npm run build


# copy production dependencies and source code into final image
FROM base AS release
WORKDIR /usr/src/app
COPY --from=prerelease /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=prerelease /usr/src/app/build ./build
COPY --from=prerelease /usr/src/app/cache ./cache
COPY --from=prerelease /usr/src/app/prisma ./prisma


ENV PROTOCOL_HEADER="x-forwarded-proto"
ENV HOST_HEADER="x-forwarded-host"
ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libjemalloc.so.2"

# run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "./build/index.js" ]
