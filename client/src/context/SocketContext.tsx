import React, { ReactNode, createContext, useContext, useState } from 'react'
import io, { Socket } from 'socket.io-client'

interface Room {
  room: string
  owner: string
}

interface SocketContextType {
  socket: Socket | null
  connect: (token: string) => void
  createRoom: (room: string) => void
  joinRoom: (room: string) => void
  leaveRoom: (room: string) => void
  deleteRoom: (room: string) => void
  getRooms: () => void
  sendMessage: (room: string, message: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  const connect = (token: string) => {
    const newSocket = io('http://localhost:3000', {
      query: { authentication: token },
    })
    setSocket(newSocket)

    newSocket.on('roomsList', (rooms: Room[]) => {
      console.log('Rooms List:', rooms)
    })

    newSocket.on('roomCreated', (room: Room) => {
      console.log('Room Created:', room)
    })

    newSocket.on('roomDeleted', (room: string) => {
      console.log('Room Deleted:', room)
    })
  }

  const createRoom = (room: string) => {
    if (socket) {
      socket.emit('createRoom', room)
    }
  }

  const joinRoom = (room: string) => {
    if (socket) {
      socket.emit('joinRoom', room)
    }
  }

  const leaveRoom = (room: string) => {
    if (socket) {
      socket.emit('leaveRoom', room)
    }
  }

  const deleteRoom = (room: string) => {
    if (socket) {
      socket.emit('deleteRoom', room)
    }
  }

  const getRooms = () => {
    if (socket) {
      socket.emit('getRooms')
    }
  }

  const sendMessage = (room: string, message: string) => {
    if (socket) {
      socket.emit('message', { room, message, user: socket.id })
    }
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        connect,
        createRoom,
        joinRoom,
        leaveRoom,
        deleteRoom,
        getRooms,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
