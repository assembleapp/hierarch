import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory"
import { WebSocketLink } from "apollo-link-ws"
import { createHttpLink } from "apollo-link-http"
import { getMainDefinition } from "apollo-utilities"
import { setContext } from "apollo-link-context"
import { split } from "apollo-link"

const wsLink = new WebSocketLink({
  uri: `ws://${process.env.REACT_APP_URL_HASURA}`,
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        // TODO is this needed if used alongside authLink?
        "x-hasura-access-key": process.env.REACT_APP_HASURA_PASSCODE,
      }
    }
  },

})

const httpLink = createHttpLink({
  uri: `https://${process.env.REACT_APP_URL_HASURA}`
})

const authLink = setContext((_, { headers }) => (
  { headers: {
    ...headers,
      "x-hasura-access-key": process.env.REACT_APP_HASURA_PASSCODE,
  } }
))

const link = split(({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
)

const graph = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache(),
})

export default graph