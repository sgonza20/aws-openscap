import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { describeInstances } from '../functions/describe-instances/resource';

const schema = a.schema({
  State: a
    .model({
      Name: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()]),
  Instance: a
    .model({
      InstanceId: a.string(),
      InstanceType: a.string(),
      State: a.ref("State"),
    })
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()]),
  GetInstances: a
    .query()
    .returns(a.ref("Instance").array())
    .handler(a.handler.function(describeInstances))
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
