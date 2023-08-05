import { createApp } from "vue"
import { createHead } from "@unhead/vue"
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

const head = createHead()

head.use({
  hooks: {
    "dom:beforeRenderTag": ctx => {
      if (ctx.tag.tag !== "title" || !ctx.tag.textContent) return

      ctx.tag.textContent =
        window.location.pathname !== "/"
          ? `${ctx.tag.textContent} - ${TITLE}`
          : TITLE
    }
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage },
    {
      path: "/login",
      component: LoginPage,
      meta: { hideHeader: true }
    },
    { path: "/account", component: AccountPage },
    { path: "/rooms", component: RoomsPage },
    { path: "/room/:id?", component: RoomPage },
    {
      path: "/packs",
      component: PacksPage
    },
    {
      path: "/my-packs",
      component: MyPacksPage
    },
    {
      path: "/pack/:id",
      component: PackPage
    },
    { path: "/:pathMatch(.*)*", component: NotFoundPage }
  ]
})

const app = createApp(App)

app.use(router)
app.use(head)
app.use(VWave, {})
app.directive("tooltip", VTooltip)

app.mount("#app")
