ARG NODE_VERSION=23.6.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

WORKDIR /app

ENV NODE_ENV=production

FROM base as build

RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential

COPY --link package.json package-lock.json .
RUN npm install

COPY --link . .

FROM base

COPY --from=build /app /app

CMD ["node", "run", "start"]
