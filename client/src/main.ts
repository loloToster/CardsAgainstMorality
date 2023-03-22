import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"

import "./style.scss"

import App from "./App.vue"

import HomePage from "./pages/HomePage.vue"
import LoginPage from "./pages/LoginPage.vue"
import GamePage from "./pages/GamePage.vue"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage, name: "Home" },
    { path: "/login", component: LoginPage, name: "Login" },
    { path: "/game/:id?", component: GamePage, name: "Game" }
  ]
})

const app = createApp(App)

app.use(router)

app.mount("#app")
