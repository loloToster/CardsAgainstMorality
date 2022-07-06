function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
}

const userId = getCookie("id")

const socket = io()

socket.on("connect", () => {
    console.log("connected")
    socket.emit("join_game", userId)
})

const users = document.querySelector(".users")
socket.on("new_user", (data) => {
    console.log("new user", data)
    const li = document.createElement("li")
    li.innerText = data
    users.appendChild(li)
})
