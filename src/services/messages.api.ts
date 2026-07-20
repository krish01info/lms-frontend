import api from './api'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ApiConversationSummary {
  id: string
  participant: {
    id: string
    name: string
    avatar: string | null
  }
  lastMessage: string | null
  lastMessageAt: string
  lastMessageSenderId: string | null
  unreadCount: number
  createdAt: string
}

export interface ApiMessageResponse {
  id: string
  conversationId: string
  senderId: string
  content: string
  readAt: string | null
  createdAt: string
  sender: {
    id: string
    name: string
    avatar: string | null
  }
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ConversationsListResponse {
  conversations: ApiConversationSummary[]
  pagination: PaginationInfo
}

interface MessagesListResponse {
  messages: ApiMessageResponse[]
  pagination: PaginationInfo
}

// ─── API Calls ─────────────────────────────────────────────────────────────

// GET /messages/conversations
export async function getConversations(page = 1, limit = 20) {
  const { data } = await api.get('/messages/conversations', { params: { page, limit } })
  return data.data as ConversationsListResponse
}

// POST /messages/conversations
export async function createConversation(participantId: string) {
  const { data } = await api.post('/messages/conversations', { participantId })
  return data.data.conversation as ApiConversationSummary
}

// GET /messages/conversations/:conversationId/messages
export async function getMessages(conversationId: string, page = 1, limit = 50) {
  const { data } = await api.get(`/messages/conversations/${conversationId}/messages`, {
    params: { page, limit },
  })
  return data.data as MessagesListResponse
}

// POST /messages/conversations/:conversationId/messages
export async function sendMessage(conversationId: string, content: string) {
  const { data } = await api.post(`/messages/conversations/${conversationId}/messages`, { content })
  return data.data.message as ApiMessageResponse
}

// PATCH /messages/conversations/:conversationId/read
export async function markConversationRead(conversationId: string) {
  const { data } = await api.patch(`/messages/conversations/${conversationId}/read`)
  return data.data as { count: number }
}
