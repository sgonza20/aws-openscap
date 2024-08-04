import { EC2Client, DescribeInstancesCommand, DescribeInstancesCommandOutput } from '@aws-sdk/client-ec2';

const ec2Client = new EC2Client({ region: "us-east-2" });

interface EC2Instance {
    InstanceId: string;
    InstanceType: string;
    State: { Name: string };
}

interface Reservation {
    Instances?: Array<{
        InstanceId?: string;
        InstanceType?: string;
        State?: { Name?: string };
    }>;
}

export const fetchInstances = async (): Promise<EC2Instance[]> => {
    try {
        const command = new DescribeInstancesCommand({});
        const data: DescribeInstancesCommandOutput = await ec2Client.send(command);

        // Format the instances data
        const instances: EC2Instance[] = (data.Reservations ?? [])
            .flatMap((reservation: Reservation) =>
                (reservation.Instances ?? []).map(instance => ({
                    InstanceId: instance.InstanceId ?? "",
                    InstanceType: instance.InstanceType ?? "",
                    State: { Name: instance.State?.Name ?? "" },
                }))
            )
            .filter(instance => instance.InstanceId !== "");

        return instances;
    } catch (error) {
        console.error("Error fetching instances:", error);
        throw new Error("Failed to fetch instances");
    }
};

// ES module export for Lambda handler
export const handler = async (event: any) => {
    try {
        const instances = await fetchInstances();
        return {
            statusCode: 200,
            body: JSON.stringify(instances),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: (error as Error).message }),
        };
    }
};
