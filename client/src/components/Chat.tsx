import React, { useState, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'

interface Room {
  room: string
  owner: string
}

const Chat: React.FC = () => {
  const { socket, getRooms, joinRoom, leaveRoom, deleteRoom, sendMessage } =
    useSocket()
  const [messages, setMessages] = useState<{ user: string; message: string }[]>(
    []
  )
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState<string>('')

  useEffect(() => {
    if (socket) {
      socket.on('roomsList', (rooms: Room[]) => {
        setRooms(rooms)
      })

      socket.on('roomCreated', (room: Room) => {
        setRooms((prevRooms) => [...prevRooms, room])
      })

      socket.on('userJoined', (userId: string) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: 'system', message: `User ${userId} joined` },
        ])
      })

      socket.on('userLeft', (userId: string) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: 'system', message: `User ${userId} left` },
        ])
      })

      socket.on('roomDeleted', (room: string) => {
        setRooms((prevRooms) => prevRooms.filter((r) => r.room !== room))
        setMessages((prevMessages) => [
          ...prevMessages,
          { user: 'system', message: `Room ${room} deleted` },
        ])
        if (currentRoom === room) setCurrentRoom(null)
      })

      socket.on('message', (data: { user: string; message: string }) => {
        setMessages((prevMessages) => [...prevMessages, data])
      })

      getRooms()

      return () => {
        socket.off('roomsList')
        socket.off('roomCreated')
        socket.off('userJoined')
        socket.off('userLeft')
        socket.off('roomDeleted')
        socket.off('message')
      }
    }
  }, [socket, getRooms, currentRoom])

  const handleJoinRoom = (room: string) => {
    joinRoom(room)
    setCurrentRoom(room)
  }

  const handleLeaveRoom = (room: string) => {
    leaveRoom(room)
    setCurrentRoom(null)
  }

  const handleDeleteRoom = (room: string) => {
    deleteRoom(room)
  }

  const handleSendMessage = () => {
    if (currentRoom && newMessage) {
      sendMessage(currentRoom, newMessage)
      setNewMessage('')
    }
  }

  return (
    <div>
      <h2>Rooms</h2>
      <ul>
        {rooms.map((room, index) => (
          <li key={index}>
            {room.room}
            {currentRoom === room.room ? (
              <button onClick={() => handleLeaveRoom(room.room)}>Leave</button>
            ) : (
              <button onClick={() => handleJoinRoom(room.room)}>Join</button>
            )}
            {socket && socket.id === room.owner && (
              <button onClick={() => handleDeleteRoom(room.room)}>
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
      <h2>Messages</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.user}:</strong> {msg.message}
          </li>
        ))}
      </ul>
      {currentRoom && (
        <div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="New Message"
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  )
}

export default Chat
