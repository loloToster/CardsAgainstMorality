import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import VWave from "v-wave"

import "./style.scss"

import App from "./App.vue"

import HomePage from "./pages/HomePage.vue"
import LoginPage from "./pages/LoginPage.vue"
import RoomPage from "./pages/RoomPage.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage, name: "Home" },
    { path: "/login", component: LoginPage, name: "Login" },
    { path: "/room/:id?", component: RoomPage, name: "Room" }
  ]
})

const app = createApp(App)

app.use(router)
app.use(VWave, {})

app.mount("#app")
