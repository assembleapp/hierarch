import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory"
import { WebSocketLink } from "apollo-link-ws"
import { createHttpLink } from "apollo-link-http"
import { getMainDefinition } from "apollo-utilities"
import { setContext } from "apollo-link-context"
import { split } from "apollo-link"

const graph = (address, passcode) => {
  const authLink = setContext((_, { headers }) => (
    { headers: {
      ...headers,
        "x-hasura-access-key": passcode,
    } }
  ))

  const httpLink = createHttpLink({ uri: `https://${address}` })

  const wsLink = new WebSocketLink({
    uri: `ws://${address}`,
    options: {
      reconnect: true,
      connectionParams: {
        headers: {
          // TODO is this needed if used alongside authLink?
          "x-hasura-access-key": passcode,
        }
      }
    },
  })

  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  )

  return new ApolloClient({
    link: authLink.concat(link),
    cache: new InMemoryCache(),
  })
}

export default graph
