// Локальная база данных
let carDatabase = JSON.parse(localStorage.getItem('carDatabase')) || []
let savedHours = JSON.parse(localStorage.getItem('savedHours')) || []

// Ссылки на элементы
const carForm = document.getElementById('car-form')
const regNumberInput = document.getElementById('reg-number')
const carTableBody = document.querySelector('#car-table tbody')
const totalHoursElement = document.getElementById('total-hours')
const toggleTableButton = document.getElementById('toggle-table')
const tableContainer = document.getElementById('table-container')
const saveHoursButton = document.getElementById('save-hours')
const savedHoursList = document.getElementById('saved-hours-list')

// Регулярное выражение для проверки формата гос. номера
const regNumberPattern = /^\d{4}[A-Z]{2}-[1-7]$/

// Показать/скрыть таблицу
toggleTableButton.addEventListener('click', () => {
	tableContainer.classList.toggle('hidden')
})

// Функция для обновления таблицы автомобилей
function updateCarTable() {
	carTableBody.innerHTML = ''
	let totalHoursToday = 0

	carDatabase.forEach((car, carIndex) => {
		let totalHoursForCar = 0
		car.records.forEach((record, recordIndex) => {
			totalHoursForCar += record.hours
			totalHoursToday += record.hours

			const row = document.createElement('tr')
			row.innerHTML = `
        <td>${car.regNumber}</td>
        <td>${record.date}</td>
        <td>${record.hours.toFixed(1)}</td>
        <td>${totalHoursForCar.toFixed(1)}</td>
        <td>
          <button class="edit" data-car-index="${carIndex}" data-record-index="${recordIndex}">Редактировать</button>
          <button class="delete" data-car-index="${carIndex}" data-record-index="${recordIndex}">Удалить</button>
        </td>
      `
			carTableBody.appendChild(row)
		})
	})

	totalHoursElement.textContent = totalHoursToday.toFixed(1)
}

// Сохранить общие часы за день
saveHoursButton.addEventListener('click', () => {
	const date = new Date().toLocaleDateString()
	const totalHoursToday = parseFloat(totalHoursElement.textContent)

	savedHours.push({ date, totalHours: totalHoursToday })
	localStorage.setItem('savedHours', JSON.stringify(savedHours))
	updateSavedHours()
})

// Обновить список сохранённых дней
function updateSavedHours() {
	savedHoursList.innerHTML = ''
	savedHours.forEach((day, index) => {
		const li = document.createElement('li')
		li.innerHTML = `
      ${day.date}: ${day.totalHours.toFixed(1)} ч
      <button class="delete-day" data-day-index="${index}">Удалить</button>
    `
		savedHoursList.appendChild(li)
	})
}

// Удаление сохранённых дней
savedHoursList.addEventListener('click', e => {
	if (e.target.classList.contains('delete-day')) {
		const dayIndex = e.target.dataset.dayIndex
		savedHours.splice(dayIndex, 1)
		localStorage.setItem('savedHours', JSON.stringify(savedHours))
		updateSavedHours()
	}
})

// Обработчик формы добавления записи
carForm.addEventListener('submit', e => {
	e.preventDefault()

	const regNumber = regNumberInput.value.trim()
	const hours = parseFloat(document.getElementById('hours').value)

	// Проверка формата гос. номера
	if (!regNumberPattern.test(regNumber)) {
		alert('Введите корректный государственный номер в формате "1234AB-1".')
		return
	}

	const date = new Date().toLocaleDateString()
	let car = carDatabase.find(car => car.regNumber === regNumber)

	if (!car) {
		car = { regNumber, records: [] }
		carDatabase.push(car)
	}

	car.records.push({ date, hours })
	localStorage.setItem('carDatabase', JSON.stringify(carDatabase))

	updateCarTable()
	carForm.reset()
})

// Удаление и редактирование записей
carTableBody.addEventListener('click', e => {
	if (e.target.classList.contains('delete')) {
		const carIndex = e.target.dataset.carIndex
		const recordIndex = e.target.dataset.recordIndex

		carDatabase[carIndex].records.splice(recordIndex, 1)
		if (carDatabase[carIndex].records.length === 0) {
			carDatabase.splice(carIndex, 1)
		}

		localStorage.setItem('carDatabase', JSON.stringify(carDatabase))
		updateCarTable()
	}

	if (e.target.classList.contains('edit')) {
		const carIndex = e.target.dataset.carIndex
		const recordIndex = e.target.dataset.recordIndex
		const record = carDatabase[carIndex].records[recordIndex]

		regNumberInput.value = carDatabase[carIndex].regNumber
		document.getElementById('hours').value = record.hours

		carDatabase[carIndex].records.splice(recordIndex, 1)

		if (carDatabase[carIndex].records.length === 0) {
			carDatabase.splice(carIndex, 1)
		}

		localStorage.setItem('carDatabase', JSON.stringify(carDatabase))
		updateCarTable()
	}
})

// Инициализация
updateCarTable()
updateSavedHours()
