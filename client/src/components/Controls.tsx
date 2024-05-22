import React, { useState } from 'react'
import axios from 'axios'
import { useSocket } from '../context/SocketContext'

const Controls: React.FC = () => {
  const { connect, createRoom } = useSocket()
  const [connected, setConnected] = useState(false)
  const [newRoom, setNewRoom] = useState('')

  const handleConnect = async () => {
    try {
      const response = await axios.post('http://localhost:3000/login')
      const token = response.data.token
      connect(token)
      setConnected(true)
    } catch (error) {
      console.error('Login or connection failed', error)
    }
  }

  const handleCreateRoom = () => {
    createRoom(newRoom)
    setNewRoom('')
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
      }}
    >
      <div>
        <button onClick={handleConnect} disabled={connected}>
          {connected ? 'Connected' : 'Login & Connect'}
        </button>
        <input
          type="text"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="New Room"
          disabled={!connected}
        />
        <button onClick={handleCreateRoom} disabled={!connected || !newRoom}>
          Create Room
        </button>
      </div>
    </div>
  )
}

export default Controls
