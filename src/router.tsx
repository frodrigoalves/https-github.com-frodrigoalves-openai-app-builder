import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { AdminPage } from './views/AdminPage'
import { CartPage } from './views/CartPage'
import { CollectionPage } from './views/CollectionPage'
import { HomePage } from './views/HomePage'
import { InfoPage } from './views/InfoPage'
import { AdminLoginPage } from './views/AdminLoginPage'
import { ProductPage } from './views/ProductPage'
import { demoSessionKey } from './demoSession'

const rootRoute = createRootRoute({
  component: Outlet,
  beforeLoad: ({ location }) => {
    if (
      location.pathname.startsWith('/verwaltung')
      && location.pathname !== '/verwaltung/anmelden'
      && window.sessionStorage.getItem(demoSessionKey) !== 'active'
    ) {
      throw redirect({ to: '/verwaltung/anmelden', replace: true })
    }
  },
})

const adminSectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verwaltung/$section',
  component: AdminRoute,
})

const routes = [
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/shop/$category', component: CollectionPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/produkt/$productId', component: ProductPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/warenkorb', component: CartPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/ueber-uns', component: () => <InfoPage page="about" /> }),
  createRoute({ getParentRoute: () => rootRoute, path: '/kontakt', component: () => <InfoPage page="contact" /> }),
  createRoute({ getParentRoute: () => rootRoute, path: '/verwaltung/anmelden', component: AdminLoginPage }),
  createRoute({ getParentRoute: () => rootRoute, path: '/verwaltung', component: () => <AdminPage section="übersicht" /> }),
  adminSectionRoute,
]

function AdminRoute() {
  const section = adminSectionRoute.useParams().section
  return <AdminPage section={section} />
}

const routeTree = rootRoute.addChildren(routes)

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
