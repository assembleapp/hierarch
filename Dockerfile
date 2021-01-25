FROM node

RUN mkdir /launch
WORKDIR /launch

ADD package.json yarn.lock /launch/
RUN yarn
