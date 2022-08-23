import React from 'react'

class TasksManager extends React.Component {
  state = {
    task: '',
    tasks: []
  }
  intervalId = ''
  api = 'http://localhost:3005/tasks'

  toggleTimer(taskId){ 
    const { tasks } = this.state

    const currentTask = tasks.find(task => task.id === taskId) 
    if (!currentTask.isRunning) {
      this.intervalId = setInterval(() => this.startTimer(taskId), 1000)
    } else {
      clearInterval(this.intervalId)
    }

    this.setState(() => ({
      tasks: tasks.map((task) => {
        const { id, isRunning } = task
        if (taskId !== id) return task
        const changedTask = {
          ...task,
          isRunning: !isRunning
        }
        this.updateTask(changedTask,taskId) // update
        return changedTask
      })
    }))
  }

  updateTask(task,id){
    const options = { method: 'PUT', body: JSON.stringify(task), headers: { 'Content-Type': 'application/json' } }

        fetch(`${this.api}/${id}`,options)
        .then(response => {
          if (response.ok) return response.json()
          return Promise.reject(response)
        })
  }

  startTimer (taskId) { 
    this.setState(state => {
      const {tasks} = state
      const newTasks = tasks.map(task => {
        const {id,isRunning,time} = task
        if (id === taskId && isRunning) return { ...task, time: time + 1 }
        return task
      })
      return { tasks: newTasks }
    })
  }

  endTask (taskId) {
    const { tasks } = this.state

    const actualTask = tasks.find(task => task.id === taskId)
    if (actualTask.isRunning) clearInterval(this.intervalId)

    this.setState(() => ({
      tasks: tasks.map((task) => {
        const { id } = task
        if (taskId !== id) return task
        const changedTask = {
          ...task,
          isDone: true,
          isRunning: false
        }
        this.updateTask(changedTask,taskId) // update
        return changedTask
      })
    }))

  }

  deleteTask (taskId) {
    const { tasks } = this.state

    this.setState(() => ({
      tasks: tasks.map((task) => {
        const { id } = task
        if (taskId !== id) return task
        const changedTask = {
          ...task,
          isRemoved: true
        }
        this.updateTask(changedTask,taskId) // update
        return changedTask
      })
    }))
  }

  componentDidUpdate () {
    
  }

  handleChange = e => {
    const {value} = e.target
    this.setState({ task: value})
  }

  handleSubmit = e => {
    e.preventDefault()
    const {task,tasks} = this.state

    const newTask = {
      name: task,
      time: 0,
      isRunning: false,
      isDone: false,
      isRemoved: false
    }

    const options = { method: 'POST', body: JSON.stringify(newTask), headers: { 'Content-Type': 'application/json' } }

    fetch(this.api,options)
    .then(response => {
      if (response.ok) return response.json()
      return Promise.reject(response)
    })
    .then(data => {
      const id = data.id
      this.setState({
        tasks: [...tasks,{...newTask,id}],
        task: ''
      })
    })
  }

  componentDidMount(){
    fetch(this.api)
    .then(response => {
      if (response.ok) return response.json()
      return Promise.reject(response)
    })
    .then(data => {
      this.setState({
        tasks: [...data],
      })
    })
  }

  render () {
    const { tasks, task } = this.state
    const filteredTasks = tasks.filter(task => !task.isRemoved)
    const sortedTasks = [...filteredTasks].sort((taskA, taskB) => taskA.isDone - taskB.isDone) // true - false = 1 - 0 = 1

    return (
      <>
        <ul>
          {
            sortedTasks.map(({ name, time, isRunning, isDone, id }) => {
              return (
                <section key={id}>
                  <header>{`${name} : ${time}`}</header>
                  <footer>
                    <button onClick={(e) => this.toggleTimer(id)} disabled={isDone}>{isRunning ? 'STOP' : 'START'}</button>
                    <button onClick={(e) => this.endTask(id)} disabled={isDone}>{isDone ? 'ZAKOŃCZONE' : 'ZAKOŃCZ'}</button>
                    <button onClick={(e) => this.deleteTask(id)} disabled={!isDone}>USUŃ</button>
                  </footer>
                </section>)
            })
          }
        </ul>
       <form onSubmit={this.handleSubmit}>
        <label>
          Nazwa zadania:
          <input value={task} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Dodaj" />
        </form>
      </>
    )
  }
}

export default TasksManager
