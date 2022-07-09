const socket = io()

/**
 * User related
 */
function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(";").shift()
}

const userId = getCookie("id")

socket.on("connect", () => {
    console.log("connected as", socket.id)
    socket.emit("join_game", userId)
})

socket.io.on("reconnect", () => {
    location.reload()
})

const users = document.querySelector(".users")
socket.on("players", players => {
    users.innerHTML = ""
    players.forEach(p => {
        users.appendChild(createUser(p.nick, p.crown, p.check, p.points))
    })
})

/**
 * Game related
 */
let imTsar = false
let curBlackCardData = {
    pick: 0
}

const startButton = document.getElementById("start-btn")

startButton.onclick = () => fetch("/start").catch(e => {
    startButton.innerText = e
    startButton.style.background = "red"
})

const blackCard = document.getElementById("black-card")
const topCards = document.querySelector(".top-cards")
const choicesBox = document.querySelector(".choices")
const submitButton = document.getElementById("submit-btn")
const chooseBtn = document.getElementById("choose-btn")
const hand = document.querySelector(".hand")

let submitted = false
submitButton.onclick = () => {
    if (submitted) return

    const whiteCards = Array.from(topCards.getElementsByClassName("card--white"))
    if (whiteCards.length < curBlackCardData.pick) return

    let submition = whiteCards.map(c => parseInt(c.dataset.id))

    fetch("/submit_cards", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(submition)
    })

    submitted = true
    submitButton.innerText = "Submitted"
}

function onTopCardBtnClick(card, cardEl) {
    cardEl.remove()
    submitButton.classList.remove("active")

    const [wrapper, newCardEl] = createCardWithWrapper(card, "white")
    newCardEl.addEventListener("click", () => onHandCardClick(card, wrapper))
    hand.appendChild(wrapper)
}

function onHandCardClick(card, wrapper) {
    if (imTsar) return

    // check if there are available picks
    const numOfPicks = topCards.getElementsByClassName("card--white").length

    if (numOfPicks >= curBlackCardData.pick)
        return

    submitButton.classList.toggle("active", numOfPicks + 1 == curBlackCardData.pick)

    wrapper.remove()
    let cardEl = createCard(card, "white")
    let xBtn = document.createElement("button")
    xBtn.innerHTML = "X"
    xBtn.addEventListener("click", () => onTopCardBtnClick(card, cardEl))
    cardEl.appendChild(xBtn)
    topCards.appendChild(cardEl)
}

socket.on("new_round", data => {
    startButton.remove()

    imTsar = data.tsar
    chooseBtn.classList.remove("active")

    submitted = false
    submitButton.innerText = "Submit"
    submitButton.classList.remove("active")
    topCards.innerHTML = ""
    choicesBox.innerHTML = ""

    curBlackCardData = data.black_card
    blackCard.querySelector(".card__text").innerHTML = curBlackCardData.text
    blackCard.querySelector(".card__pack span").innerText = curBlackCardData.pack

    const cards = data.cards
    hand.innerHTML = ""
    cards.forEach(c => {
        const [wrapper, cardEl] = createCardWithWrapper(c, "white")
        cardEl.addEventListener("click", () => onHandCardClick(c, wrapper))
        hand.appendChild(wrapper)
    })
})

function onChoiceClick(choice, choiceEl) {
    document.querySelectorAll(".choices__choice")
        .forEach(e => e.classList.remove("active"))
    choiceEl.classList.add("active")
    topCards.innerHTML = ""
    choice.forEach(c => {
        topCards.appendChild(createCard(c, "white"))
    })
}

socket.on("choices", choices => {
    topCards.innerHTML = ""
    choicesBox.innerHTML = ""

    chooseBtn.classList.toggle("active", imTsar)

    choices.forEach((choice, i) => {
        const choiceEl = createChoiceElement(choice, i + 1)
        choiceEl.addEventListener("click", () => onChoiceClick(choice, choiceEl))
        choicesBox.appendChild(choiceEl)
    })
})

chooseBtn.onclick = () => {
    if (!imTsar) return

    const decision = document.querySelector(".choices__choice.active").dataset.hash
    fetch("/tsar_decision", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({ decision })
    })
}

/**
 * Element creation
 */
function createChoiceElement(choice, innerText) {
    let el = document.createElement("div")
    el.classList.add("choices__choice")
    el.dataset.hash = choice.reduce((acc, c) => {
        return acc + c["id"].toString()
    }, "")
    el.innerText = innerText
    return el
}

function createCardWithWrapper(card) {
    let wrapper = document.createElement("div")
    wrapper.classList.add("hand__card-wrapper")
    const cardEl = createCard(card, "white")
    wrapper.appendChild(cardEl)
    return [wrapper, cardEl]
}

function createCard(card, color) {
    let cardEl = document.createElement("div")
    cardEl.dataset.id = card.id
    cardEl.classList.add("card")
    cardEl.classList.add("card--" + color)

    cardEl.innerHTML = card.text

    let packEl = document.createElement("div")
    packEl.classList.add("card__pack")

    let img = document.createElement("img")
    packEl.appendChild(img)

    let packName = document.createElement("span")
    packName.innerText = card.pack
    packEl.appendChild(packName)

    cardEl.appendChild(packEl)

    return cardEl
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
