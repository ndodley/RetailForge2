import api from './axios'

export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

export async function sendChatMessage(message: string): Promise<string> {
    const { data } = await api.post<{ reply: string }>('/api/chat', { message })
    return data.reply
}
