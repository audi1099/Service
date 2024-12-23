// Добавляем уведомления
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

// Изменяем поведение кнопки скрытия таблицы
elements.toggleTableButton.addEventListener('click', () => {
	const isHidden = elements.tableContainer.classList.toggle('hidden')
	const message = isHidden ? 'Таблица скрыта' : 'Таблица отображена'
	showNotification(message)
})

// Рендер таблицы с редактируемыми ячейками
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
        <td contenteditable="true" class="editable-reg-number" data-car-index="${carIndex}" data-record-index="${recordIndex}">
          ${car.regNumber}
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

// Слушатель для редактирования данных в таблице
elements.carTableBody.addEventListener('input', e => {
	if (e.target.classList.contains('editable-reg-number')) {
		const carIndex = e.target.dataset.carIndex
		const recordIndex = e.target.dataset.recordIndex
		const newRegNumber = e.target.textContent.trim()

		if (!regNumberPattern.test(newRegNumber)) {
			showNotification('Неверный формат гос. номера!', 'error')
			return
		}

		carDatabase[carIndex].regNumber = newRegNumber
		saveToLocalStorage('carDatabase', carDatabase)
		showNotification('Гос. номер обновлён.')
	}

	if (e.target.classList.contains('editable-hours')) {
		const carIndex = e.target.dataset.carIndex
		const recordIndex = e.target.dataset.recordIndex
		const newHours = parseFloat(e.target.textContent)

		if (isNaN(newHours) || newHours <= 0) {
			showNotification('Введите корректное количество часов!', 'error')
			return
		}

		carDatabase[carIndex].records[recordIndex].hours = newHours
		saveToLocalStorage('carDatabase', carDatabase)
		renderCarTable()
		showNotification('Количество часов обновлено.')
	}
})

// Сохранение общих часов
elements.saveHoursButton.addEventListener('click', () => {
	const date = new Date().toLocaleDateString()
	const totalHoursToday = parseFloat(elements.totalHoursElement.textContent)

	savedHours.push({ date, totalHours: totalHoursToday })
	saveToLocalStorage('savedHours', savedHours)
	renderSavedHours()
	showNotification('Часы за день сохранены.')
})
