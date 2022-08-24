import React from 'react'

class TasksManager extends React.Component {
  state = {
    task: '',
    tasks: []
  }

  intervalId = ''
  api = 'http://localhost:3005/tasks'

  toggleTimer (taskId) { // implementacja do przemyślenia
    const { tasks } = this.state

    const currentTask = tasks.find(task => task.id === taskId)
    if (!currentTask.isRunning) {
      this.intervalId = setInterval(() => this.incTime(taskId), 1000)
    } else {
      clearInterval(this.intervalId)
    }

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

  stopTimer (taskId) {
    const { tasks } = this.state

    const currentTask = tasks.find(task => task.id === taskId)
    if (currentTask.isRunning) clearInterval(this.intervalId)
  }

  incTime (taskId) {
    const { tasks } = this.state
    this.setState(() => ({
      tasks: tasks.map(task => {
        const { id, isRunning, time } = task
        if (id === taskId && isRunning) return { ...task, time: time + 1 }
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
          <header>{`${name} : ${time}`}</header>
          <footer>
            <button onClick={() => this.toggleTimer(id)} disabled={isDone}>{isRunning ? 'STOP' : 'START'}</button>
            <button onClick={() => this.endTask(id)} disabled={isDone}>{isDone ? 'ZAKOŃCZONE' : 'ZAKOŃCZ'}</button>
            <button onClick={() => this.removeTask(id)} disabled={!isDone}>USUŃ</button>
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
      time: 0,
      isRunning: false,
      isDone: false,
      isRemoved: false
    }
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
        <ul>{this.insertTasks()}</ul>
        <form onSubmit={this.handleFormSubmit}>
          <label>
          Nazwa zadania:
            <input value={task} onChange={this.handleInputChange} />
          </label>
          <input type="submit" value="Dodaj" />
        </form>
      </>
    )
  }
}

export default TasksManager
