import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import axios from 'axios'
import Select from 'react-select'

Modal.setAppElement('#root')

const CreateEventModal = ({ isOpen, onRequestClose, onEventCreated }) => {
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [eventType, setEventType] = useState('')
	const [eventKind, setEventKind] = useState('')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [status, setStatus] = useState(true)
	const [allDepartments, setAllDepartments] = useState([])
	const [selectedDepartments, setSelectedDepartments] = useState([])
	const [usersInSelectedDepartments, setUsersInSelectedDepartments] = useState(
		[]
	)
	const [notifiedUsers, setNotifiedUsers] = useState([])
	const [loadingDepartments, setLoadingDepartments] = useState(false)
	const [loadingUsers, setLoadingUsers] = useState(false)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (isOpen) {
			setLoadingDepartments(true)
			axios
				.get('http://localhost:3000/departments')
				.then(response => {
					setAllDepartments(response.data)
					setError(null)
				})
				.catch(error => {
					console.error('Error fetching departments:', error)
					setError('Ошибка при загрузке отделов')
				})
				.finally(() => {
					setLoadingDepartments(false)
				})
		}
	}, [isOpen])

	useEffect(() => {
		if (selectedDepartments.length > 0) {
			setLoadingUsers(true)
			axios
				.get(
					`http://localhost:3000/users?department_id=${selectedDepartments.join(
						','
					)}`
				)
				.then(response => {
					setUsersInSelectedDepartments(response.data)
					setError(null)
				})
				.catch(error => {
					console.error('Error fetching users:', error)
					setError('Ошибка при загрузке пользователей')
				})
				.finally(() => {
					setLoadingUsers(false)
				})
		} else {
			setUsersInSelectedDepartments([])
		}
	}, [selectedDepartments])

	const handleSubmit = () => {
		// Проверка обязательных полей
		if (!title) {
			setError('Заполните поле "Заголовок"')
			return
		}
		if (!eventType) {
			setError('Выберите "Тип мероприятия"')
			return
		}
		if (!eventKind) {
			setError('Выберите "Вид мероприятия"')
			return
		}
		if (!startDate) {
			setError('Укажите "Дату начала"')
			return
		}
		if (!endDate) {
			setError('Укажите "Дату окончания"')
			return
		}
		if (new Date(startDate) > new Date(endDate)) {
			setError('Дата начала не может быть позже даты окончания')
			return
		}
		if (selectedDepartments.length === 0) {
			setError('Выберите хотя бы один отдел')
			return
		}

		const eventData = {
			title,
			description,
			event_type: eventType, // Переименуем поле
			event_kind: eventKind, // Переименуем поле
			start_date: startDate, // Переименуем поле
			end_date: endDate, // Переименуем поле
			status,
			departments: selectedDepartments, // Оставляем как массив чисел
			notified_users: notifiedUsers, // Добавляем массив уведомленных пользователей
			user_role: 'admin', // Оставляем, но сервер его не использует
		}

		console.log('Sending event data:', eventData) // Логирование данных перед отправкой

		axios
			.post('http://localhost:3000/events', eventData)
			.then(response => {
				console.log('Event created successfully:', response.data)
				onEventCreated() // Обновляем список событий в AdminPage
				onRequestClose() // Закрываем модальное окно
			})
			.catch(error => {
				console.error('Error creating event:', error)
				if (error.response) {
					console.error('Server responded with:', error.response.data)
					setError(
						'Ошибка при создании события: ' +
							(error.response.data.error || 'Неизвестная ошибка')
					)
				} else {
					setError('Ошибка при создании события')
				}
			})
	}

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			contentLabel='Создать событие'
			className='modal'
			overlayClassName='overlay'
		>
			<button className='close-button' onClick={onRequestClose}>
				×
			</button>
			<h3>Создание нового события</h3>
			{error && <div className='error-message'>{error}</div>}
			<div className='two-parts-events-edit'>
				<div className='one-of-part-events-edit'>
					<div className='flex-items'>
						<label className='label-title'>Заголовок:</label>
						<input
							className='input-title'
							type='text'
							value={title}
							onChange={e => setTitle(e.target.value)}
							required
						/>
					</div>

					<div className='flex-items'>
						<label className='label-event-type'>Тип мероприятия:</label>
						<select
							className='input-event-type'
							value={eventType}
							onChange={e => setEventType(e.target.value)}
							required
						>
							<option value=''>Выберите тип</option>
							<option value='online'>Онлайн</option>
							<option value='offline'>Офлайн</option>
							<option value='offline'>Заочное</option>
						</select>
					</div>

					<div className='flex-items'>
						<label className='label-event-kind'>Вид мероприятия:</label>
						<select
							className='input-event-kind'
							value={eventKind}
							onChange={e => setEventKind(e.target.value)}
							required
						>
							<option value=''>Выберите вид</option>
							<option value='conference'>Конференция</option>
							<option value='call'>Созвон</option>
							<option value='meeting'>Сбор</option>
							<option value='hall_event'>Мероприятие в актовом зале</option>
						</select>
					</div>

					<div className='flex-items'>
						<label className='label-start-date'>Дата начала:</label>
						<input
							className='input-start-date'
							type='date'
							value={startDate}
							onChange={e => setStartDate(e.target.value)}
							required
						/>
					</div>

					<div className='flex-items'>
						<label className='label-end-date'>Дата окончания:</label>
						<input
							className='input-end-date'
							type='date'
							value={endDate}
							onChange={e => setEndDate(e.target.value)}
							required
						/>
					</div>

					<div className='flex-items'>
						<label className='label-status'>Статус:</label>
						<input
							className='input-status'
							type='checkbox'
							checked={status}
							onChange={e => setStatus(e.target.checked)}
						/>
					</div>

					<div className='flex-items'>
						<label className='label-departments'>Отделы:</label>
						{loadingDepartments ? (
							<p>Загрузка отделов...</p>
						) : allDepartments.length > 0 ? (
							<Select
								isMulti
								options={allDepartments.map(department => ({
									value: department.id_department,
									label: department.department_name,
								}))}
								value={selectedDepartments.map(id => ({
									value: id,
									label: allDepartments.find(dep => dep.id_department === id)
										.department_name,
								}))}
								onChange={selectedOptions => {
									setSelectedDepartments(
										selectedOptions.map(option => option.value)
									)
								}}
								placeholder='Выберите отделы'
							/>
						) : (
							<p>Отделы не загружены</p>
						)}
					</div>

					<div className='flex-items'>
						<label className='label-notified-users'>Пользователи:</label>
						{loadingUsers ? (
							<p>Загрузка пользователей...</p>
						) : usersInSelectedDepartments.length > 0 ? (
							usersInSelectedDepartments.map(user => (
								<div key={user.id_user}>
									<input
										type='checkbox'
										id={`user-${user.id_user}`}
										checked={notifiedUsers.includes(user.id_user)}
										onChange={() => {
											setNotifiedUsers(prev =>
												prev.includes(user.id_user)
													? prev.filter(id => id !== user.id_user)
													: [...prev, user.id_user]
											)
										}}
									/>
									<label htmlFor={`user-${user.id_user}`}>
										{user.login_users} ({user.last_name} {user.first_name})
									</label>
								</div>
							))
						) : (
							<p>Пользователи не загружены</p>
						)}
					</div>

					<button className='button-event-edit' onClick={handleSubmit}>
						Создать
					</button>
				</div>

				<textarea
					placeholder='Описание меропрteиятия'
					className='input-description-create'
					value={description}
					onChange={e => setDescription(e.target.value)}
				/>
			</div>
		</Modal>
	)
}

export default CreateEventModal
