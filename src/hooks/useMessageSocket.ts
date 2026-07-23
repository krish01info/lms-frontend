import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from '@/contexts/AuthContext'

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'

interface UseSocketOptions {
  conversationId?: string
  onNewMessage?: (message: any) => void
  onMessagesRead?: (data: { conversationId: string; readByUserId: string; count: number }) => void
}

/**
 * Hook that connects to Socket.IO and handles real-time chat events.
 * The socket connects on mount and disconnects on unmount.
 * Callbacks are stored in refs to prevent reconnection on render.
 */
export function useMessageSocket(options: UseSocketOptions = {}) {
  const { conversationId } = options
  const { user } = useAuth()
  const socketRef = useRef<Socket | null>(null)

  // Store callbacks in refs to avoid reconnection when they change
  const onNewMessageRef = useRef(options.onNewMessage)
  const onMessagesReadRef = useRef(options.onMessagesRead)
  onNewMessageRef.current = options.onNewMessage
  onMessagesReadRef.current = options.onMessagesRead

  useEffect(() => {
    const token = localStorage.getItem('learnflow_access_token')
    if (!token || !user?.id) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.debug('[socket] connected as', user.id)
    })

    socket.on('connect_error', (err) => {
      console.warn('[socket] connection error:', err.message)
    })

    socket.on('message:new', (message: any) => {
      if (onNewMessageRef.current) {
        onNewMessageRef.current(message)
      }
    })

    socket.on('messages:read', (data: { conversationId: string; readByUserId: string; count: number }) => {
      if (onMessagesReadRef.current && data.conversationId === conversationId) {
        onMessagesReadRef.current(data)
      }
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
    // Only reconnect when user changes — not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Join/leave conversation room when active conversation changes
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !conversationId) return

    socket.emit('conversation:join', { conversationId })

    return () => {
      socket.emit('conversation:leave', { conversationId })
    }
  }, [conversationId])

  // Imperative methods for use in the page
  const emitTypingStart = (convId: string) => {
    socketRef.current?.emit('typing:start', { conversationId: convId })
  }

  const emitTypingStop = (convId: string) => {
    socketRef.current?.emit('typing:stop', { conversationId: convId })
  }

  const emitRead = (convId: string) => {
    socketRef.current?.emit('conversation:read', { conversationId: convId })
  }

  return {
    socket: socketRef.current,
    emitTypingStart,
    emitTypingStop,
    emitRead,
  }
}
