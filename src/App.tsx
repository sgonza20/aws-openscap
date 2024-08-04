import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { AppLayout, Box, BreadcrumbGroup, Button, ContentLayout, Header, Table, SpaceBetween, Pagination, Modal } from "@cloudscape-design/components";

const client = generateClient<Schema>();

type Instance = {
  InstanceId: string;
  InstanceType: string;
  State: { Name: string };
};

function EC2InstanceList() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstances, setSelectedInstances] = useState<Instance[]>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);

async function fetchInstances() {
  try {
    const { data, errors } = await client.queries.GetInstances();
    if (errors) {
      console.error("Error fetching instances:", errors);
      return;
    }

    if (data) {
      // Type assertion to ensure data is treated as RawInstance[]
      const instancesData: Instance[] = data as Instance[];

      // Log data for debugging
      console.log("Raw data fetched:", instancesData);

      // Transform data to match the EC2Instance type
      const transformedData: Instance[] = instancesData
        .filter((instance: Instance | null | undefined): instance is Instance => instance !== null && instance !== undefined)
        .map((instance: Instance) => ({
          InstanceId: instance.InstanceId ?? "",
          InstanceType: instance.InstanceType ?? "",
          State: {
            Name: instance.State?.Name ?? ""
          }
        }));
        
      setInstances(transformedData);
    }
  } catch (error) {
    console.error("Error fetching instances:", error);
  }
}


  useEffect(() => {
    fetchInstances();
  }, []);

  function confirmDelete() {
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
            <SpaceBetween size="m" direction="horizontal">
              <Button onClick={fetchInstances} variant="primary">
              </Button>
            </SpaceBetween>
            <Table
              columnDefinitions={[
                {
                  id: "instanceId",
                  header: "Instance ID",
                  cell: (item: Instance) => item.InstanceId,
                  isRowHeader: true,
                },
                {
                  id: "instanceType",
                  header: "Instance Type",
                  cell: (item: Instance) => item.InstanceType,
                },
                {
                  id: "state",
                  header: "State",
                  cell: (item: Instance) => item.State.Name,
                },
              ]}
              items={instances.length > 0 ? instances : []}
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
                <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
                  <SpaceBetween size="m">
                    <b>No EC2 Instances</b>
                    <Button onClick={() => {}}>Create Instance</Button>
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
                      <Button variant="primary" onClick={() => {}}>
                        Run
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
              <Button variant="link" onClick={() => setIsDeleteModalVisible(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmDelete}>
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        Are you sure you want to delete the selected instances? This action cannot be undone.
      </Modal>
    </>
  );
}

export default EC2InstanceList;
