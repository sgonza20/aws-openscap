import { useEffect, useState } from "react";
import { AppLayout, Box, BreadcrumbGroup, Button, ContentLayout, Header, Table, SpaceBetween, Pagination, Modal } from "@cloudscape-design/components";
import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

type EC2Instance = {
  InstanceId: string;
  InstanceType: string;
  State: { Name: string };
};

export function EC2InstanceList() {
  const [instances, setInstances] = useState<EC2Instance[]>([]);
  const [selectedInstances, setSelectedInstances] = useState<EC2Instance[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);

  useEffect(() => {
    const fetchInstances = async () => {

      const ec2Client = new EC2Client({ region: "us-east-2" }); // Lets see how we can adjust this dynamically


      const command = new DescribeInstancesCommand({});
      const response = await ec2Client.send(command);


      const fetchedInstances: EC2Instance[] = (response.Reservations ?? [])
        .flatMap(reservation =>
          (reservation.Instances ?? []).map(instance => ({
            InstanceId: instance.InstanceId ?? "",
            InstanceType: instance.InstanceType ?? "",
            State: { Name: instance.State?.Name ?? "" },
          }))
        )
        .filter((instance): instance is EC2Instance => instance.InstanceId !== "");

      setInstances(fetchedInstances);
    };

    fetchInstances();
  }, []);

  function confirmDelete() {
    setSelectedInstances([]);
    setIsDeleteModalVisible(false);
  }

  return (
    <>
      <AppLayout
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: "Home", href: "#" },
              { text: "EC2 Instances", href: "#" },
            ]}
          />
        }
        content={
          <ContentLayout>
            <Table
              columnDefinitions={[
                {
                  id: "instanceId",
                  header: "Instance ID",
                  cell: (item: EC2Instance) => item.InstanceId,
                  isRowHeader: true,
                },
                {
                  id: "instanceType",
                  header: "Instance Type",
                  cell: (item: EC2Instance) => item.InstanceType,
                },
                {
                  id: "state",
                  header: "State",
                  cell: (item: EC2Instance) => item.State.Name,
                },
              ]}
              items={instances}
              selectedItems={selectedInstances}
              onSelectionChange={({ detail }) => setSelectedInstances(detail.selectedItems)}
              pagination={
                <Pagination
                  currentPageIndex={currentPageIndex}
                  onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                  pagesCount={Math.ceil(instances.length / 10)}
                />
              }
              empty={
                <Box
                  margin={{ vertical: "xs" }}
                  textAlign="center"
                  color="inherit"
                >
                  <SpaceBetween size="m">
                    <b>No EC2 Instances</b>
                    <Button onClick={() => {}}>
                      Create Instance
                    </Button>
                  </SpaceBetween>
                </Box>
              }
              selectionType="multi"
              variant="full-page"
              stickyHeader={true}
              resizableColumns={true}
              loadingText="Loading instances"
              trackBy="InstanceId"
              header={
                <Header
                  variant="h1"
                  actions={
                    <SpaceBetween size="xs" direction="horizontal">
                      <Button
                        onClick={() => selectedInstances.length > 0 && setIsDeleteModalVisible(true)}
                        disabled={selectedInstances.length === 0}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {}}
                      >
                        Create Instance
                      </Button>
                    </SpaceBetween>
                  }
                >
                  EC2 Instances ({instances.length})
                </Header>
              }
            />
          </ContentLayout>
        }
      />
      <Modal
        onDismiss={() => setIsDeleteModalVisible(false)}
        visible={isDeleteModalVisible}
        closeAriaLabel="Close"
        header="Confirm Deletion"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => setIsDeleteModalVisible(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmDelete}>
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
      </Modal>
    </>
  );
}

export default EC2InstanceList;
