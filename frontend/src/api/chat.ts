import api from './apiClient'

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export interface ChatSession {
    id: number
    conversationId: string
    title: string | null
    createdAt: string
    updatedAt: string
}

export async function sendChatMessage(message: string, conversationId: string): Promise<string> {
    const { data } = await api.post<{ reply: string }>('/api/chat', { message, conversationId })
    return data.reply
}

export async function createChatSession(): Promise<ChatSession> {
    const { data } = await api.post<ChatSession>('/api/chat/sessions')
    return data
}

export async function listChatSessions(): Promise<ChatSession[]> {
    const { data } = await api.get<ChatSession[]>('/api/chat/sessions')
    return data
}

export async function getChatSessionMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data } = await api.get<ChatMessage[]>(`/api/chat/sessions/${conversationId}/messages`)
    return data
}

export async function clearChatSession(conversationId: string): Promise<void> {
    await api.post(`/api/chat/sessions/${conversationId}/clear`)
}

export async function deleteChatSession(conversationId: string): Promise<void> {
    await api.delete(`/api/chat/sessions/${conversationId}`)
}

export async function deleteAllChatSessions(): Promise<void> {
    await api.delete('/api/chat/sessions')
}
