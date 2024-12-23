// Кэширование элементов
const elements = {
	carForm: document.getElementById('car-form'),
	identifierInput: document.getElementById('identifier-input'),
	hoursInput: document.getElementById('hours'),
	identifierType: document.getElementById('identifier-type'),
	carTableBody: document.querySelector('#car-table tbody'),
	totalHoursElement: document.getElementById('total-hours'),
	toggleTableButton: document.getElementById('toggle-table'),
	tableContainer: document.getElementById('table-container'),
	saveHoursButton: document.getElementById('save-hours'),
	savedHoursList: document.getElementById('saved-hours-list'),
}

// Локальная база данных
let carDatabase = JSON.parse(localStorage.getItem('carDatabase')) || []
let savedHours = JSON.parse(localStorage.getItem('savedHours')) || []
let lastSavedDate =
	savedHours.length > 0 ? savedHours[savedHours.length - 1].date : null

// Регулярные выражения
const regNumberPattern = /^\d{4}[A-Z]{2}-[1-7]$/ // Формат гос. номера
const vinLastFourPattern = /^\d{4}$/ // Последние 4 цифры ВИН-кода

// Функция для сохранения данных в localStorage
function saveToLocalStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value))
}

// Показать уведомление
function showNotification(message, type = 'success') {
	const notification = document.createElement('div')
	notification.className = `notification ${type}`
	notification.textContent = message

	document.body.appendChild(notification)
	setTimeout(() => {
		notification.classList.add('show')
	}, 10)

	setTimeout(() => {
		notification.classList.remove('show')
		setTimeout(() => notification.remove(), 500)
	}, 3000)
}

// Автоматическое сохранение часов за текущий день
function saveHoursForCurrentDay() {
	const currentDate = new Date().toLocaleDateString()
	const totalHoursToday = parseFloat(elements.totalHoursElement.textContent)

	if (lastSavedDate !== currentDate && totalHoursToday > 0) {
		savedHours.push({ date: currentDate, totalHours: totalHoursToday })
		saveToLocalStorage('savedHours', savedHours)
		renderSavedHours()
		lastSavedDate = currentDate
		showNotification(`Часы за ${lastSavedDate} автоматически сохранены.`)
	}
}

// Добавление записи
function addCarRecord(identifier, hours) {
	const date = new Date().toLocaleDateString()
	let car = carDatabase.find(car => car.identifier === identifier)

	if (!car) {
		car = { identifier, records: [] }
		carDatabase.push(car)
	}

	car.records.push({ date, hours })
	saveToLocalStorage('carDatabase', carDatabase)
	renderCarTable()
}

// Рендер таблицы автомобилей
function renderCarTable() {
	elements.carTableBody.innerHTML = ''
	let totalHoursToday = 0

	carDatabase.forEach((car, carIndex) => {
		let totalHoursForCar = car.records.reduce(
			(sum, record) => sum + record.hours,
			0
		)
		totalHoursToday += totalHoursForCar

		car.records.forEach((record, recordIndex) => {
			const row = document.createElement('tr')
			row.innerHTML = `
        <td contenteditable="true" class="editable-identifier" data-car-index="${carIndex}" data-record-index="${recordIndex}">
          ${car.identifier}
        </td>
        <td>${record.date}</td>
        <td contenteditable="true" class="editable-hours" data-car-index="${carIndex}" data-record-index="${recordIndex}">
          ${record.hours.toFixed(1)}
        </td>
        <td>${totalHoursForCar.toFixed(1)}</td>
        <td>
          <button class="delete" data-car-index="${carIndex}" data-record-index="${recordIndex}">Удалить</button>
        </td>
      `
			elements.carTableBody.appendChild(row)
		})
	})

	elements.totalHoursElement.textContent = totalHoursToday.toFixed(1)
}

// Рендер сохранённых часов
function renderSavedHours() {
	elements.savedHoursList.innerHTML = ''
	savedHours.forEach((day, index) => {
		const li = document.createElement('li')
		li.innerHTML = `
      ${day.date}: ${day.totalHours.toFixed(1)} ч
      <button class="delete-day" data-day-index="${index}">Удалить</button>
    `
		elements.savedHoursList.appendChild(li)
	})
}

// Удаление записей
elements.carTableBody.addEventListener('click', e => {
	const carIndex = e.target.dataset.carIndex
	const recordIndex = e.target.dataset.recordIndex

	if (e.target.classList.contains('delete')) {
		carDatabase[carIndex].records.splice(recordIndex, 1)
		if (carDatabase[carIndex].records.length === 0)
			carDatabase.splice(carIndex, 1)
		saveToLocalStorage('carDatabase', carDatabase)
		renderCarTable()
	}
})

// Обработчик формы
elements.carForm.addEventListener('submit', e => {
	e.preventDefault()

	const identifierType = elements.identifierType.value
	const identifierInput = elements.identifierInput.value.trim()
	const hours = parseFloat(elements.hoursInput.value)

	if (isNaN(hours) || hours <= 0) {
		alert('Введите корректное количество часов.')
		return
	}

	let identifier

	if (identifierType === 'reg') {
		// Проверка гос. номера
		if (!regNumberPattern.test(identifierInput)) {
			alert('Введите корректный номер (например, 1234AB-1).')
			return
		}
		identifier = identifierInput
	} else if (identifierType === 'vin') {
		// Проверка последних 4 цифр ВИН-кода
		if (!vinLastFourPattern.test(identifierInput)) {
			alert('Введите последние 4 цифры ВИН-кода.')
			return
		}
		identifier = identifierInput // Сохраняем как есть
	}

	// Проверка даты и автоматическое сохранение
	saveHoursForCurrentDay()

	// Добавляем запись
	addCarRecord(identifier, hours)
	elements.carForm.reset()
})

// Сохранение общих часов за день
elements.saveHoursButton.addEventListener('click', () => {
	saveHoursForCurrentDay()
})

// Показать/скрыть таблицу
elements.toggleTableButton.addEventListener('click', () => {
	const isHidden = elements.tableContainer.classList.toggle('hidden')
	const message = isHidden ? 'Таблица скрыта' : 'Таблица отображена'
	showNotification(message)
})

// Удаление сохранённых дней
elements.savedHoursList.addEventListener('click', e => {
	if (e.target.classList.contains('delete-day')) {
		const dayIndex = e.target.dataset.dayIndex
		savedHours.splice(dayIndex, 1)
		saveToLocalStorage('savedHours', savedHours)
		renderSavedHours()
		showNotification('Сохранённый день удалён.')
	}
})

// Инициализация
renderCarTable()
renderSavedHours()
