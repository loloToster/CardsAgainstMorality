import { createApp, nextTick } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import VWave from "v-wave"

import "./styles/style.scss"

import App from "./App.vue"

import HomePage from "./pages/HomePage.vue"
import LoginPage from "./pages/LoginPage.vue"
import RoomPage from "./pages/RoomPage.vue"
import PacksPage from "./pages/PacksPage.vue"
import PackPage from "./pages/PackPage.vue"
import NotFoundPage from "./pages/NotFoundPage.vue"

import { TITLE } from "./consts"

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
    { path: "/room/:id?", component: RoomPage, name: "Room" },
    {
      path: "/packs",
      component: PacksPage,
      name: "Card Packs"
    },
    {
      path: "/pack/:id",
      component: PackPage,
      name: "Card Pack"
    },
    { path: "/:pathMatch(.*)*", component: NotFoundPage, name: "404" }
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

app.mount("#app")
