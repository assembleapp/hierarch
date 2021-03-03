FROM node

RUN mkdir /hierarch
WORKDIR /hierarch
COPY package.json yarn.lock /hierarch/
RUN yarn
