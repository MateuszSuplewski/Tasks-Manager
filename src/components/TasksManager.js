import React from 'react'

class TasksManager extends React.Component {
  state = {
    task: '',
    tasks: []
  }

  intervalId = ''
  api = 'http://localhost:3005/tasks'

  toggleTimer (taskId) {
    const { tasks } = this.state

    const currentTask = tasks.find(task => task.id === taskId)
    !currentTask.isRunning ? this.startTimer(taskId): this.stopTimer(taskId)
    
    this.setState(() => ({
      tasks: tasks.map((task) => {
        const { id, isRunning } = task
        if (taskId !== id) return task
        const toggledTask = { ...task, isRunning: !isRunning }
        this.updateTask(toggledTask, taskId)
        return toggledTask
      })
    }))
  }

  startTimer (taskId) {this.intervalId = setInterval(() => this.incTime(taskId), 1000)}

  stopTimer (taskId) {
    const { tasks } = this.state
    const currentTask = tasks.find(task => task.id === taskId)

    if (currentTask.isRunning) {
    clearInterval(this.intervalId)
    this.intervalId = null
    }
  }

  incTime (taskId) {
    const { tasks } = this.state
    this.setState(() => ({
      tasks: tasks.map(task => {
        const { id, isRunning, time } = task
        if (id === taskId && isRunning) return { ...task, time: this.createUpdatedTimer(time) }
        return task
      })
    }))
  }

  endTask (taskId) {
    const { tasks } = this.state
    this.stopTimer(taskId)

    this.setState(() => ({
      tasks: tasks.map(task => {
        const { id } = task
        if (taskId !== id) return task

        const endedTask = {
          ...task,
          isDone: true,
          isRunning: false
        }
        this.updateTask(endedTask, taskId)
        return endedTask
      })
    }))
  }

  insertTasks () {
    const { tasks } = this.state
    const filteredTasks = tasks.filter(task => !task.isRemoved)
    const sortedTasks = [...filteredTasks].sort((taskA, taskB) => taskA.isDone - taskB.isDone)

    return sortedTasks.map(({ name, time, isRunning, isDone, id }) => {
      return (
        <section key={id}>
          <header className='task-content'>{`${name} : ${time}`}</header>
          <footer>
            <button className={isRunning ? 'btn-stop' : 'btn-start'} onClick={() => this.toggleTimer(id)} disabled={(this.intervalId && !isRunning) || isDone }>{isRunning ? 'STOP' : 'START'}</button>
            <button className='btn-end' onClick={() => this.endTask(id)} disabled={isDone}>{isDone ? 'ZAKOŃCZONE' : 'ZAKOŃCZ'}</button>
            <button className='btn-delete' onClick={() => this.removeTask(id)} disabled={!isDone}>USUŃ</button>
          </footer>
        </section>)
    })
  }

  addTask (task) {
    const { tasks } = this.state
    const options = { method: 'POST', body: JSON.stringify(task), headers: { 'Content-Type': 'application/json' } }

    this._fetch(options)
      .then(data => {
        const id = data.id
        this.setState({
          tasks: [...tasks, { ...task, id }],
          task: ''
        })
      })
  }

  updateTask (task, id) {
    const options = { method: 'PUT', body: JSON.stringify(task), headers: { 'Content-Type': 'application/json' } }
    this._fetch(options, `/${id}`)
  }

  removeTask (taskId) {
    const { tasks } = this.state

    this.setState(() => ({
      tasks: tasks.map(task => {
        const { id } = task
        if (taskId !== id) return task

        const removedTask = { ...task, isRemoved: true }
        this.updateTask(removedTask, taskId)
        return removedTask
      })
    }))
  }

  createTask () {
    const { task } = this.state
    return {
      name: task,
      time: "00:00:00",
      isRunning: false,
      isDone: false,
      isRemoved: false
    }
  }

  createUpdatedTimer(time){

    let hours = time.slice(0,2)
    let minutes = time.slice(3,5)
    let seconds = time.slice(6,8)

    seconds = Number(seconds) + 1
    if(Number(seconds) === 60) {
      minutes = Number(minutes) + 1
      seconds = 0
    }

    if(Number(minutes) === 60) {
      hours = Number(hours) + 1
      minutes = 0
    }

    if(Number(minutes) < 10) minutes = '0' + Number(minutes)
    if(Number(hours) < 10) hours = '0' + Number(hours)
    if(Number(seconds) < 10) seconds = '0' + Number(seconds)

    return( `${hours}:${minutes}:${seconds}`)
  }

  handleInputChange = e => {
    const { value } = e.target
    this.setState({ task: value })
  }

  handleFormSubmit = e => {
    e.preventDefault()
    const newTask = this.createTask()

    this.addTask(newTask)
  }

  _fetch (options, additionalPath = '') {
    const url = `${this.api}${additionalPath}`
    return fetch(url, options)
      .then(response => {
        if (response.ok) return response.json()
        return Promise.reject(response)
      })
  }

  componentDidMount () {
    this._fetch()
      .then(data => {
        this.setState({
          tasks: [...data]
        })
      })
  }

  render () {
    const { task } = this.state

    return (
      <>
        <ul className='task-list'>{this.insertTasks()}</ul>
        <form onSubmit={this.handleFormSubmit}>
          <input className='task-input' value={task} onChange={this.handleInputChange} placeholder='Wpisz nazwe zadania' />
          <input className='task-submit' type="submit" value="Dodaj" disabled={!task} />
        </form>
      </>
    )
  }
}

export default TasksManager
