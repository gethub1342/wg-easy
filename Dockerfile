# There's an issue with node:16-alpine.
# On Raspberry Pi, the following crash happens:

# #FailureMessage Object: 0x7e87753c
# #
# # Fatal error in , line 0
# # unreachable code
# #
# #
# #

FROM docker.io/library/node:18.16.0-alpine3.17@sha256:44aaf1ccc80eaed6572a0f2ef7d6b5a2982d54481e4255480041ac92221e2f11 AS build_node_modules

# Copy Web UI
COPY src/ /app/
WORKDIR /app
RUN yarn install --immutable

# Copy build result to a new image.
# This saves a lot of disk space.
FROM docker.io/library/node:18.16.0-alpine3.17@sha256:44aaf1ccc80eaed6572a0f2ef7d6b5a2982d54481e4255480041ac92221e2f11
COPY --from=build_node_modules /app /app

# Move node_modules one directory up, so during development
# we don't have to mount it in a volume.
# This results in much faster reloading!
#
# Also, some node_modules might be native, and
# the architecture & OS of your development machine might differ
# than what runs inside of docker.
RUN mv /app/node_modules /node_modules

# Enable this to run `yarn serve`
RUN yarn global add nodemon -g nodemon

# Install Linux packages
RUN apk add -U --no-cache \
  wireguard-tools \
  dumb-init

# Expose Ports (Should prolly be removed)
EXPOSE 51820/udp
EXPOSE 51821/tcp

# Set Environment
ENV DEBUG=Server,WireGuard

# Run Web UI
WORKDIR /app
CMD ["/usr/bin/dumb-init", "node", "server.js"]
