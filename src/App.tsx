import { useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { 
  AppLayout, 
  Box, 
  BreadcrumbGroup, 
  TopNavigation, 
  Button, 
  ContentLayout, 
  Header, 
  Table, 
  SpaceBetween, 
  Pagination, 
  Modal, 
  Spinner, 
  StatusIndicator 
} from "@cloudscape-design/components";

const client = generateClient<Schema>();

function EC2InstanceList() {
  const [instances, setInstances] = useState<Array<Schema["Instance"]["type"]>>([]);
  const [selectedInstances, setSelectedInstances] = useState<Array<Schema["Instance"]["type"]>>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // const [isInvoking, setIsInvoking] = useState(false);

  useEffect(() => {
    fetchInstances();
    client.models.Instance.observeQuery().subscribe({
      next: (data) =>setInstances([...data.items])
    })
  }, []);

  async function fetchInstances() {
    setIsLoading(true);
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
            LastScanTime: instance?.LastScanTime,
            ScanStatus: instance?.ScanStatus,
          });
        })
      }
    } catch (error) {
      console.error("Error fetching instances:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function InvokeScan(InstanceID: string, DocumentName: string) {
    const { data, errors } = await client.queries.InvokeSSM({
      InstanceId: InstanceID,
      DocumentName: DocumentName,
    });
    console.log(data, errors);
    if (data?.statusCode == 200) {
      await client.models.Instance.update({
        InstanceId: InstanceID,
        LastScanTime: new Date().toISOString(),
        ScanStatus: 'InProgress',
      });
    }
  }

  function confirmScan() {
    selectedInstances.forEach((item) =>
      InvokeScan(item.InstanceId, "OpenSCAPDocument")
    );
    console.log(selectedInstances);
    setSelectedInstances([]);
  }

  function confirmDelete() {
    setIsDeleteModalVisible(false);
  }

  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        <div>
          <TopNavigation
            identity={{
              href: "#",
              title: "AWS ICE",
            }}
            utilities={[
              {
                type: "button",
                text: user?.signInDetails?.loginId,
                iconName: "user-profile",
              },
              {
                type: "button",
                text: "Sign out",
                onClick: () => signOut!(),
              },
            ]}
          />
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
                    {
                      id: "lastScanTime",
                      header: "Last Scan Time",
                      cell: (item) => item.LastScanTime ? new Date(item.LastScanTime).toLocaleString() : 'N/A',
                    },
                    {
                      id: "scanStatus",
                      header: "Scan Status",
                      cell: (item) => (
                        <StatusIndicator type={item.ScanStatus === 'Success' ? 'success' : item.ScanStatus === 'Failed' ? 'error' : 'info'}>
                          {item.ScanStatus || 'N/A'}
                        </StatusIndicator>
                      ),
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
                  header={
                    <Header
                      variant="h1"
                      actions={
                        <SpaceBetween size="xs" direction="horizontal">
                          <Button onClick={fetchInstances} variant="primary">
                            {isLoading ? <Spinner /> : "Refresh"}
                          </Button>
                          <Button
                            onClick={() => selectedInstances.length > 0 && setIsDeleteModalVisible(true)}
                            disabled={selectedInstances.length === 0}
                          >
                            Delete
                          </Button>
                          <Button variant="primary" onClick={confirmScan}>
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
        </div>
      )}
    </Authenticator>
  );
}

export default EC2InstanceList;