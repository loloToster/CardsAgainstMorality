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
    users.appendChild(createUser(data))
})

socket.on("start", (data) => {

})

function createCard(text, color = "white") {
    let card = document.createElement("div")
    card.classList.add("card")
    card.classList.add("card--" + color)

    card.innerHTML = text

    let pack = document.createElement("div")
    pack.classList.add("card__pack")

    let img = document.createElement("img")
    pack.appendChild(img)

    let packName = document.createElement("span")
    packName.innerText = "Cards Against Humanity"
    pack.appendChild(packName)

    card.appendChild(pack)

    return card
}

function createUser(nick, points = 0) {
    let li = document.createElement("li")
    li.classList.add("users__user")
    li.innerHTML = "<i class='fa-solid fa-crown'></i><i class='fa-solid fa-circle-check'></i><span class='material-symbols-outlined'>account_circle</span>"

    let nickEl = document.createElement("user__nick")
    nickEl.innerHTML = `<div class='user__nick'>${nick} (<span class='users__points'>${points}</span>)</div>`
    li.appendChild(nickEl)

    return li
}
