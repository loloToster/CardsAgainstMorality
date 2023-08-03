import { createApp, nextTick } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import VWave from "v-wave"
import { VTooltip } from "floating-vue"

import "floating-vue/dist/style.css"
import "./styles/style.scss"

import { TITLE } from "./consts"

import App from "./App.vue"

import HomePage from "./pages/HomePage.vue"
import NotFoundPage from "./pages/NotFoundPage.vue"

const LoginPage = () => import("./pages/LoginPage.vue")
const AccountPage = () => import("./pages/AccountPage.vue")
const RoomPage = () => import("./pages/RoomPage.vue")
const RoomsPage = () => import("./pages/RoomsPage.vue")
const PacksPage = () => import("./pages/PacksPage.vue")
const MyPacksPage = () => import("./pages/MyPacksPage.vue")
const PackPage = () => import("./pages/PackPage.vue")

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage, name: "Home" },
    {
      path: "/login",
      component: LoginPage,
      name: "Login",
      meta: { hideHeader: true }
    },
    { path: "/account", component: AccountPage, name: "My Account" },
    { path: "/rooms", component: RoomsPage, name: "Rooms" },
    { path: "/room/:id?", component: RoomPage, name: "Room" },
    {
      path: "/packs",
      component: PacksPage,
      name: "Card Packs"
    },
    {
      path: "/my-packs",
      component: MyPacksPage,
      name: "My Card Packs"
    },
    {
      path: "/pack/:id",
      component: PackPage,
      name: "Card Pack"
    },
    { path: "/:pathMatch(.*)*", component: NotFoundPage, name: "Not Found" }
  ]
})

// https://stackoverflow.com/a/51640162/15331983
router.afterEach(to =>
  nextTick(() => {
    document.title =
      to.path === "/" || !to.name ? TITLE : `${to.name.toString()} - ${TITLE}`
  })
)

const app = createApp(App)

app.use(router)
app.use(VWave, {})
app.directive("tooltip", VTooltip)

app.mount("#app")
