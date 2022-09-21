##################### clipper #####################
FROM node:14-alpine3.15 AS clipper
WORKDIR /app/clipper

# install typescript
RUN npm install -g typescript

# install packages
COPY clipper/package*.json ./
RUN npm install --omit=dev --ignore-scripts

# copy types
COPY types ../types

# build
COPY clipper ./
RUN npm run build

##################### manager #####################
FROM node:14-alpine3.15 AS manager
WORKDIR /app/manager

# install typescript
RUN npm install -g typescript

# install packages
COPY manager/package*.json ./
RUN npm install --omit=dev --ignore-scripts

# build
COPY manager ./
RUN npm run build

##################### final #####################
FROM node:14-alpine3.15
WORKDIR /app

COPY --from=manager /app/manager/dist manager

COPY --from=clipper /app/clipper/dist/types types
COPY --from=clipper /app/clipper/dist/clipper/src clipper/app
COPY --from=clipper /app/clipper/node_modules clipper/app/node_modules
# COPY --from=clipper /app/clipper/package*.json clipper/app/

# set environment variables
ENV DOCKER=true
ENV NODE_ENV=production
EXPOSE 4747

# run the app
CMD ["node", "clipper/app/index"]