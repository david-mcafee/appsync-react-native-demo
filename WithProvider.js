import React from "react";
import { registerRootComponent } from "expo";
import Amplify, { Auth } from "aws-amplify";
import AppSyncConfig from "./src/aws-exports";
import { createAuthLink } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import {
  ApolloLink,
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
} from "@apollo/client";
import { withAuthenticator } from "aws-amplify-react-native";
import App from "./App";
import { Rehydrated } from "aws-appsync-react";
import AWSAppSyncClient from "aws-appsync";

Amplify.configure(AppSyncConfig);

const url = AppSyncConfig.aws_appsync_graphqlEndpoint;
const region = AppSyncConfig.aws_appsync_region;
const auth = {
  type: AppSyncConfig.aws_appsync_authenticationType,
  jwtToken: async () =>
    (await Auth.currentSession()).getIdToken().getJwtToken(),
};

const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink({ url, region, auth }),
]);

const client = new AWSAppSyncClient({
  link,
  cache: new InMemoryCache(),
});

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
);

export default registerRootComponent(withAuthenticator(WithProvider));
