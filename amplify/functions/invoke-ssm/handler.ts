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
    if (!event.arguments.InstanceId) {
        return {
          statusCode: 400,
          body: "Missing InstanceID"
        };
      }
      if (!event.arguments.DocumentName) {
        return {
          statusCode: 400,
          body: "Missing Document Name",
        };
      }
      console.log("Invoking SSM document with arguments:", event.arguments);
      try {
        const command = new SendCommandCommand({
          InstanceIds: [event.arguments.InstanceId],
          DocumentName: event.arguments.DocumentName,
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
  