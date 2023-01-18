const playerColors = [
	'black',
	'blue',
	'brown',
	'cyan',
	'green',
	'grey',
	'orange',
	'red',
	'violet',
	'yellow'
]

function randomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)]
}

function getKeyString(x, y) {
	return `${x}x${y}`
}

const createName = () => {
	const adjectives = [
		'Adorable',
		'Aggressive',
		'Agreeable',
		'Alert',
		'Alive',
		'Amused',
		'Angry',
		'Annoyed',
		'Annoying',
		'Anxious',
		'Arrogant',
		'Ashamed',
		'Attractive'
	]

	const animals = [
		'Alligator',
		'Ant',
		'Anteater',
		'Antelope',
		'Ape',
		'Armadillo',
		'Baboon',
		'Bat',
		'Bear',
		'Beaver',
		'Bee',
		'Bison',
		'Boar',
		'Buffalo',
		'Butterfly',
		'Camel',
		'Capybara'
	]

	return `${randomFromArray(adjectives)} ${randomFromArray(animals)}`
}

;(() => {
	let playerId
	let playerRef
	let playerElements = {}
	let players = {}

	const gameContainer = document.querySelector('.game-container')

	function handleArrowPress(xChange = 0, yChange = 0) {
		const newX = players[playerId].x + xChange
		const newY = players[playerId].y + yChange

		if (true) {
			players[playerId].x = newX
			players[playerId].y = newY

			if (xChange === 1) {
				players[playerId].direction = 'right'
			}

			if (xChange === -1) {
				players[playerId].direction = 'left'
			}

			playerRef.set(players[playerId])
		}
	}

	function initGame() {
		new KeyPressListener('ArrowUp', () => handleArrowPress(0, -1))
		new KeyPressListener('ArrowDown', () => handleArrowPress(0, 1))
		new KeyPressListener('ArrowLeft', () => handleArrowPress(-1, 0))
		new KeyPressListener('ArrowRight', () => handleArrowPress(1, 0))

		const allPlayersRef = firebase.database().ref('players')
		const allCoinsRef = firebase.database().ref('coins')

		allPlayersRef.on('value', (snapshot) => {
			players = snapshot.val() || {}

			Object.keys(players).forEach((key) => {
				const characterState = players[key]
				let el = playerElements[key]

				el.querySelector('.Character_name').innerText =
					characterState.name
				el.querySelector('.Character_coins').innerText =
					characterState.coins
				el.setAttribute('data-color', characterState.color)
				el.setAttribute('data-direction', characterState.direction)

				const left = 16 * characterState.x + 'px'
				const top = 16 * characterState.y - 4 + 'px'
				el.style.transform = `translate3d(${left}, ${top}, 0)`
			})
		})

		allPlayersRef.on('child_added', (snapshot) => {
			const addedPlayer = snapshot.val()
			const characterElement = document.createElement('div')
			characterElement.classList.add('Character', 'grid-cell')

			if (addedPlayer.id === playerId) {
				characterElement.classList.add('you')
			}

			characterElement.innerHTML = `
				<div class="Character_shadow grid-cell"></div>
				<div class="Character_sprite grid-cell"></div>
				<div class="Character_name-container">
					<span class="Character_name"></span>
					<span class="Character_coins">0</span>
				</div>
				<div class="Character_you-arrow"></div>
			`

			console.log(addedPlayer)
			playerElements[addedPlayer.id] = characterElement

			characterElement.querySelector('.Character_name').innerText =
				addedPlayer.name
			characterElement.querySelector('.Character_coins').innerText =
				addedPlayer.coins
			characterElement.setAttribute('data-color', addedPlayer.color)
			characterElement.setAttribute(
				'data-direction',
				addedPlayer.direction
			)
			const left = 16 * addedPlayer.x + 'px'
			const top = 16 * addedPlayer.y - 4 + 'px'
			characterElement.style.transform = `translate3d(${left}, ${top}, 0)`
			gameContainer.appendChild(characterElement)
		})
	}

	firebase.auth().onAuthStateChanged((user) => {
		console.log(user)
		if (user) {
			// User is signed in.
			playerId = user.uid
			playerRef = firebase.database().ref(`players/${playerId}`)

			playerRef.set({
				id: playerId,
				name: createName(),
				direction: 'left',
				color: randomFromArray(playerColors),
				x: 4,
				y: 4,
				coins: 0
			})
		}

		playerRef.onDisconnect().remove()

		initGame()
	})

	firebase
		.auth()
		.signInAnonymously()
		.catch((error) => {
			let errorCode = error.code
			let errorMessage = error.message

			console.log({ errorCode, errorMessage })
		})
})()
