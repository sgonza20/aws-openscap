import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { describeInstances } from '../functions/describe-instances/resource';

const schema = a.schema({
  State: a.enum(["running", "stopped", "pending"]),
  Instance: a
    .model({
      InstanceId: a.string().required(),
      PlatformType: a.string(),
      PlatformName: a.string(),
    })
    .identifier(["InstanceId"])
    .authorization((allow) => [allow.publicApiKey(), allow.authenticated()]),
  InstanceInformation: a.customType({
    InstanceId: a.string(),
    PlatformType: a.string(),
    PlatformName: a.string(),
  }),
  GetInstances: a
    .query()
    .returns(a.ref("InstanceInformation").array())
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
