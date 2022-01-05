# Hvilket image skal denne docker baseres på
FROM node:17

# Hvor arbejder denne docker i
WORKDIR /app

# ENV
ENV PATH /app/node_modules/.bin:$PATH

# Kopier package.json til Docker maskinen
COPY package*.json ./

# Kør kommando
RUN yarn

# Kopier source filer
COPY . .

EXPOSE 5600

# Serve
CMD ["yarn", "start"]