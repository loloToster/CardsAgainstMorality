/**
 * User editing
 */
const usernameWrapper = document.querySelector(".header__username-wrapper")
const editUsernameBtn = document.getElementById("edit-username")
const usernameInp = document.getElementById("username-inp")
const usernameEl = document.querySelector(".header__username")

editUsernameBtn.onclick = () => {
    const editing = usernameWrapper.classList.toggle("editing")
    editUsernameBtn.innerText = editing ? "✅" : "✏️"

    if (editing) return
    if (!usernameInp.value.length) return

    usernameEl.innerText = usernameInp.value
    fetch("/change_nick?n=" + usernameInp.value)
}

function fileToBase64(file) {
    return new Promise(resolve => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
    })
}

const avatarInp = document.getElementById("avatar-inp")
const avatar = document.querySelector(".header__avatar")

avatar.onclick = () => avatarInp.click()

avatarInp.addEventListener("input", async () => {
    const file = avatarInp.files[0]
    if (!file) return

    const base64 = await fileToBase64(file)

    let res = await fetch("/change_avatar", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({ avatar: base64 })
    })

    let newAvatar = await res.text()
    avatar.style.setProperty("--avatar", `url(${newAvatar})`)
})

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
        users.appendChild(createUser(p))
    })
})

/**
 * Packs modal
 */
const packsModal = document.querySelector(".packs-modal")
const allPacks = document.querySelectorAll(".packs-modal__pack")
const checkAll = document.getElementById("packs-modal__check-all")
const uncheckAll = document.getElementById("packs-modal__uncheck-all")
const startBtn = document.getElementById("packs-modal__start")

const openPacksModalBtn = document.getElementById("open-packs-modal")

openPacksModalBtn.onclick = () => {
    packsModal.classList.add("active")
}

packsModal.addEventListener("click", e => {
    if (e.target == packsModal) packsModal.classList.remove("active")
})

allPacks.forEach(pack =>
    pack.addEventListener("click", () =>
        pack.classList.toggle("active")
    )
)

checkAll.onclick = () => allPacks.forEach(p => p.classList.add("active"))
uncheckAll.onclick = () => allPacks.forEach(p => p.classList.remove("active"))

startBtn.addEventListener("click", async () => {
    let choosenPacks = []
    document.querySelectorAll(".packs-modal__pack.active")
        .forEach(p => choosenPacks.push(p.dataset.watermark))

    if (!choosenPacks.length)
        return

    await fetch("/start", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(choosenPacks)
    })

    openPacksModalBtn.style.display = "none"
    packsModal.classList.remove("active")
})

/**
 * Game related
 */
let imTsar = false
let curBlackCardData = {
    pick: 0
}

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

function updateBlackCard(card) {
    curBlackCardData = card
    blackCard.querySelector(".card__text").innerHTML = card.text
    blackCard.querySelector(".card__pack span").innerText = card.pack
}

function updateHandCards(cards) {
    hand.innerHTML = ""
    cards.forEach(c => {
        const [wrapper, cardEl] = createCardWithWrapper(c, "white")
        cardEl.addEventListener("click", () => onHandCardClick(c, wrapper))
        hand.appendChild(wrapper)
    })
}

socket.on("new_round", data => {
    openPacksModalBtn.style.display = "none"

    imTsar = data.tsar
    chooseBtn.classList.remove("active")

    submitted = false
    submitButton.innerText = "Submit"
    submitButton.classList.remove("active")
    topCards.innerHTML = ""
    choicesBox.innerHTML = ""

    updateBlackCard(data.black_card)
    updateHandCards(data.cards)
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

function updateChoices(choices) {
    topCards.innerHTML = ""
    choicesBox.innerHTML = ""

    chooseBtn.classList.toggle("active", imTsar)

    choices.forEach((choice, i) => {
        const choiceEl = createChoiceElement(choice, i + 1)
        choiceEl.addEventListener("click", () => onChoiceClick(choice, choiceEl))
        choicesBox.appendChild(choiceEl)
    })
}

socket.on("choices", choices => {
    updateChoices(choices)
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
 * Reconnecting
 */
socket.on("rejoin", data => {
    openPacksModalBtn.style.display = "none"

    imTsar = data.is_tsar

    updateBlackCard(data.black_card)
    updateHandCards(data.cards)

    if (data.choices)
        updateChoices(data.choices)
})

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

    let cardText = document.createElement("span")
    cardText.classList.add("card__text")
    cardText.innerHTML = card.text
    cardEl.appendChild(cardText)

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

function createUser({ nick, avatar, crown, check, points, disconnected }) {
    let li = document.createElement("li")
    li.classList.add("users__user")

    li.classList.toggle("disconnected", disconnected)
    if (!disconnected) {
        li.classList.toggle("crown", crown)
        li.classList.toggle("check", check)
    }

    li.innerHTML = "<i class='fa-solid fa-crown'></i><i class='fa-solid fa-circle-check'></i><i class='fa-solid fa-wifi'></i>"

    let avatarEl = document.createElement("img")
    avatarEl.classList.add("users__avatar")
    avatarEl.src = avatar
    li.appendChild(avatarEl)

    let nickEl = document.createElement("div")
    nickEl.classList.add("user__nick")
    nickEl.innerHTML = `${nick} (<span class='users__points'>${points}</span>)`
    li.appendChild(nickEl)

    return li
}
