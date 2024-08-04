import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { AppLayout, Box, BreadcrumbGroup, Button, ContentLayout, Header, Table, SpaceBetween, Pagination, Modal } from "@cloudscape-design/components";

const client = generateClient<Schema>();

function EC2InstanceList() {
  const [instances, setInstances] = useState<Array<Schema["Instance"]["type"]>>([]);
  const [selectedInstances, setSelectedInstances] = useState<Array<Schema["Instance"]["type"]>>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);

  async function fetchInstances() {
    try {
      const { data, errors } = await client.queries.GetInstances();

      console.log("Instances found:", data);

      if (errors) {
        console.error("Error fetching instances:", errors);
        return;
      }

      if (data) {
        data.forEach(async (instance) => {
          // TODO: Probably need to check if it's already in there and update instead of create
          await client.models.Instance.create({
            InstanceId: instance?.InstanceId!,
            PlatformName: instance?.PlatformName,
            PlatformType: instance?.PlatformType,
          });
        })
      }
    } catch (error) {
      console.error("Error fetching instances:", error);
    }
  }

  useEffect(() => {
    fetchInstances();
    client.models.Instance.observeQuery().subscribe({
      next: (data) =>setInstances([...data.items])
    })
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
            <Table
              columnDefinitions={[
                {
                  id: "instanceId",
                  header: "Instance ID",
                  cell: (item) => item.InstanceId,
                  isRowHeader: true,
                },
                {
                  id: "platformType",
                  header: "Platform Type",
                  cell: (item) => item.PlatformType || undefined,
                },
                {
                  id: "platformName",
                  header: "Platform Name",
                  cell: (item) => item.PlatformName || undefined,
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
              // trackBy="InstanceId"
              header={
                <Header
                  variant="h1"
                  actions={
                    <SpaceBetween size="xs" direction="horizontal">
                      <Button onClick={fetchInstances} variant="primary">
                        Refresh
                      </Button>
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
