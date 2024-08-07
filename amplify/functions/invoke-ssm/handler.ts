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
    const { InstanceId, DocumentName, OS, Benchmark } = event.arguments;
  
    if (!InstanceId) {
      return {
        statusCode: 400,
        body: "Missing InstanceID",
      };
    }
    if (!DocumentName) {
      return {
        statusCode: 400,
        body: "Missing Document Name",
      };
    }
    if (!OS) {
      return {
        statusCode: 400,
        body: "Missing OS",
      };
    }
    if (!Benchmark) {
      return {
        statusCode: 400,
        body: "Missing Benchmark",
      };
    }
  
    console.log("Invoking SSM document with arguments:", event.arguments);
    try {
      const command = new SendCommandCommand({
        InstanceIds: [InstanceId],
        DocumentName: DocumentName,
        Parameters: {
          OS: [OS],
          Benchmark: [Benchmark],
        },
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
  