# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app
RUN apk --no-cache add ffmpeg 

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
WORKDIR /tmp/dev
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
# install curl for the run-dev script
RUN apk --no-cache add curl

ARG ZSTATIC_PATH="/var/www/"
ENV ZSTATIC_PATH=$ZSTATIC_PATH

WORKDIR /usr/src/app
COPY --from=install /tmp/dev/node_modules node_modules
COPY . .

# Build project 
RUN mkdir -p cache
RUN ./run-dev.sh
RUN bun --bun run vite build


# copy production dependencies and source code into final image
FROM base AS release
WORKDIR /usr/src/app

COPY --from=prerelease /usr/src/app/build ./build
COPY --from=prerelease /usr/src/app/node_modules ./node_modules
RUN mkdir -p cache

ENV PROTOCOL_HEADER="x-forwarded-proto"
ENV HOST_HEADER="x-forwarded-host"

# run the app
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "./build/index.js" ]
