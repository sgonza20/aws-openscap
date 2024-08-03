import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "@cloudscape-design/global-styles/index.css";
// import { useEffect, useState } from "react";
// import type { Schema } from "../amplify/data/resource";
// import { generateClient } from "aws-amplify/data";
import { AppLayout, ContentLayout, HelpPanel, TopNavigation } from "@cloudscape-design/components";

// const client = generateClient<Schema>();

function App() {
  // useEffect(() => {
  //   client.models.Todo.observeQuery().subscribe({
  //     next: (data) => setTodos([...data.items]),
  //   });
  // }, []);

  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        <div>
          <TopNavigation
            identity={{
              href: "#",
              title: "AWS OpenSCAP",
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
          content={
            <ContentLayout>
              Hi
            </ContentLayout>
          }
          tools={
            <HelpPanel header={<h2>Help</h2>}>
              Help!
            </HelpPanel>
          }/>
        </div>
      )}
    </Authenticator>
  );
}

export default App;
