import {
    SSMClient,
    SendCommandCommand,
    SendCommandCommandOutput,
  } from "@aws-sdk/client-ssm";
  import type { Schema } from "../../data/resource";
  
  const ssmClient = new SSMClient();
  
  export const handler: Schema["InvokeSSM"]["functionHandler"] = async (
    event: any
  ) => {
    if (!event.arguments.instanceId) {
        return {
          statusCode: 400,
          body: "Missing InstanceID" + JSON.stringify(event) + event.arguments,
        };
      }
      if (!event.arguments.documentName) {
        return {
          statusCode: 400,
          body: "Missing Document Name",
        };
      }
      console.log("Invoking SSM document with arguments:", event.arguments);
      try {
        const command = new SendCommandCommand({
          InstanceIds: event.arguments.instanceId,
          DocumentName: event.arguments.documentName,
        });
    
        const data: SendCommandCommandOutput = await ssmClient.send(command);
        return {
            statusCode: 200,
            body: "OpenSCAP Scan Started",
        };
    } catch (error) {
        console.error("Error invoking SSM document:", error);
        return {
            statusCode: 500,
            body: "Failed to invoke SSM document",
        }
    }
};
  