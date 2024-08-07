import { useEffect, useState } from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { 
  AppLayout, 
  Box, 
  TopNavigation, 
  Button, 
  ContentLayout, 
  Header, 
  Table, 
  SpaceBetween, 
  Pagination, 
  Modal, 
  Spinner, 
  StatusIndicator, 
  SideNavigation 
} from "@cloudscape-design/components";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";

const client = generateClient<Schema>();

function EC2Instances() {
  const [instances, setInstances] = useState<Array<Schema["Instance"]["type"]>>([]);
  const [selectedInstances, setSelectedInstances] = useState<Array<Schema["Instance"]["type"]>>([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInstances();
    client.models.Instance.observeQuery().subscribe({
      next: (data) => setInstances([...data.items])
    });
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
          await client.models.Instance.create({
            InstanceId: instance?.InstanceId!,
            PlatformName: instance?.PlatformName,
            PlatformType: instance?.PlatformType,
            LastScanTime: instance?.LastScanTime,
            ScanStatus: instance?.ScanStatus,
          });
        });
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
    if (data?.statusCode === 200) {
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
    // Add your delete logic here
  }

  return (
    <ContentLayout>
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
    </ContentLayout>
  );
}

function Remediation() {
  return (
    <ContentLayout>
      <Header variant="h1">Remediation</Header>
      <Box margin={{ vertical: "xs" }}>
        <p>This is the Remediation page where you can manage remediation tasks.</p>
      </Box>
    </ContentLayout>
  );
}

function App() {
  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        <Router>
          <div>
            <style>
              {`
                html, body, #root {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                }
              `}
            </style>
            <TopNavigation
              identity={{
                href: "#",
                title: "AWS ICE",
              }}
              utilities={[
                {
                  type: "button",
                  text: user?.signInDetails?.loginId,
                },
                {
                  type: "button",
                  text: "Sign out",
                  onClick: () => signOut!(),
                },
              ]}
            />
            <AppLayout
              navigation={
                <SideNavigation
                  items={[
                    {
                      type: "link",
                      text: "EC2 Instances",
                      href: "/",
                    },
                    {
                      type: "link",
                      text: "Remediation",
                      href: "/remediation",
                    },
                  ]}
                />
              }
              content={
                <Routes>
                  <Route path="/" element={<EC2Instances />} />
                  <Route path="/remediation" element={<Remediation />} />
                </Routes>
              }
            />
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default App;
