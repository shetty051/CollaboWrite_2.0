import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export const useSocket = (url?: string) => {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Connect to the current domain (which Vite proxy will forward to server)
    const socketUrl = url || window.location.origin
    const socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to socket server:', socket.id)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server')
    })

    return () => {
      socket.disconnect()
    }
  }, [url])

  return socketRef
}
