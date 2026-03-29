import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import Header from '../components/Header'
import HeaderPublic from '../components/HeaderPublic'

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {

  const {matches} = useRouterState();
  const isPublic = matches.some(match => match.staticData?.publicMode);
  return (
    <>
      {isPublic ? <HeaderPublic /> : <Header />}
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}
