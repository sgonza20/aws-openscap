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

const createDescribeInstancesPolicyStatement = new iam.PolicyStatement({
  sid: "CreateQuarantinedAccessKeys",
  effect: iam.Effect.ALLOW,
  actions: ["ec2:DescribeInstances"],
  resources: ["*"],
});

const fetchInstances = backend.describeInstances.resources.lambda;

fetchInstances.addToRolePolicy(createDescribeInstancesPolicyStatement);
