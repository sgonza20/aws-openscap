import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import * as iam from "aws-cdk-lib/aws-iam";
import { describeInstances } from "./functions/describe-instances/resource";

const backend = defineBackend({
  auth,
  data,
  describeInstances,
});

const cfnUserPool = backend.auth.resources.cfnResources.cfnUserPool;
cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};

const ssmPolicy = new iam.PolicyStatement({
  sid: "SSM",
  effect: iam.Effect.ALLOW,
  actions: ["ssm:DescribeInstanceInformation"],
  resources: ["*"],
});

const fetchInstances = backend.describeInstances.resources.lambda;

fetchInstances.addToRolePolicy(ssmPolicy);
