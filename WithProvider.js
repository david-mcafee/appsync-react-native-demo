import React from "react";
import { registerRootComponent } from "expo";
import Amplify, { Auth } from "aws-amplify";
import AppSyncConfig from "./src/aws-exports";
import { createAuthLink } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { ApolloProvider } from "react-apollo";
import { HttpLink } from "apollo-link-http";
import { withAuthenticator } from "aws-amplify-react-native";
import App from "./App";
import { Rehydrated } from "aws-appsync-react";
import AWSAppSyncClient from "aws-appsync";

Amplify.configure(AppSyncConfig);

const client = new AWSAppSyncClient({
  url: AppSyncConfig.aws_appsync_graphqlEndpoint,
  region: AppSyncConfig.aws_appsync_region,
  auth: {
    type: AppSyncConfig.aws_appsync_authenticationType,
    // apiKey: AppSyncConfig.aws_appsync_apiKey,
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken(),
  },
});

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
);

export default registerRootComponent(withAuthenticator(WithProvider));
