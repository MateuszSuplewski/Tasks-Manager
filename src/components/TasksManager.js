import React from 'react'

class TasksManager extends React.Component {
  state = {
    task: '',
    tasks: [
      {
        name: 'Wynies smieci',
        id: '1',
        time: 0,
        isRunning: false,
        isDone: false,
        isRemoved: false
      },
      {
        name: 'Posprzątaj pokój',
        id: '2',
        time: 0,
        isRunning: false,
        isDone: false,
        isRemoved: false
      },
      {
        name: 'Umyj auto',
        id: '3',
        time: 0,
        isRunning: false,
        isDone: false,
        isRemoved: false
      },
      {
        name: 'Obierz ziemniaki',
        id: '4',
        time: 0,
        isRunning: false,
        isDone: false,
        isRemoved: false
      }
    ]
  }
  intervalId = ''

  toggleTimer(taskId){ // przełączanie start stop zaimplementowane
    const { tasks } = this.state

    const currentTask = tasks.find(task => task.id === taskId) // szukanie taska z odpowiednim id zeby uruchomic w nim counter!
    if (!currentTask.isRunning) {
      this.intervalId = setInterval(() => this.startTimer(taskId), 1000)
    } else {
      clearInterval(this.intervalId)
    }

    this.setState(() => ({
      tasks: tasks.map((task) => {
        const { id, isRunning } = task
        if (taskId !== id) return task
        return {
          ...task,
          isRunning: !isRunning
        }
      })
    }))
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
        return {
          ...task,
          isDone: true,
          isRunning: false
        }
      })
    }))
  }

  deleteTask (taskId) {
    const { tasks } = this.state

    this.setState(() => ({
      tasks: tasks.map((task) => {
        const { id } = task
        if (taskId !== id) return task
        return {
          ...task,
          isRemoved: true
        }
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
      id: '10',  // dodac custom id pobieranie z api. /// dodac cale api :)
      time: 0,
      isRunning: false,
      isDone: false,
      isRemoved: false
    }

    this.setState({
      tasks: [...tasks,newTask],
      task: ''
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
