function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
}

const userId = getCookie("id")

const socket = io()

socket.on("connect", () => {
    console.log("connected as", socket.id)
    socket.emit("join_game", userId)
})

const users = document.querySelector(".users")
socket.on("players", (players) => {
    users.innerHTML = ""
    players.forEach(p => {
        users.appendChild(createUser(p.nick, p.crown, p.check, p.points))
    })
})

const startButton = document.getElementById("start-btn")

const hand = document.querySelector(".hand")
socket.on("new_round", (data) => {
    console.log(data)
    startButton.remove()
    const cards = data.cards
    hand.innerHTML = ""
    cards.forEach(c => {
        let wrapper = document.createElement("div")
        wrapper.classList.add("hand__card-wrapper")
        wrapper.appendChild(createCard(c.text, c.pack, "white"))
        hand.appendChild(wrapper)
    })
})

startButton.onclick = () => fetch("/start").catch(e => {
    startButton.innerText = e
    startButton.style.background = "red"
})

function createCard(text, pack, color = "white") {
    let card = document.createElement("div")
    card.classList.add("card")
    card.classList.add("card--" + color)

    card.innerHTML = text

    let packEl = document.createElement("div")
    packEl.classList.add("card__pack")

    let img = document.createElement("img")
    packEl.appendChild(img)

    let packName = document.createElement("span")
    packName.innerText = pack
    packEl.appendChild(packName)

    card.appendChild(packEl)

    return card
}

function createUser(nick, crown = false, check = false, points = 0) {
    let li = document.createElement("li")
    li.classList.add("users__user")
    li.classList.toggle("crown", crown)
    li.classList.toggle("check", check)
    li.innerHTML = "<i class='fa-solid fa-crown'></i><i class='fa-solid fa-circle-check'></i><span class='material-symbols-outlined'>account_circle</span>"

    let nickEl = document.createElement("user__nick")
    nickEl.innerHTML = `<div class='user__nick'>${nick} (<span class='users__points'>${points}</span>)</div>`
    li.appendChild(nickEl)

    return li
}
