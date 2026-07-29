import { useEffect, useRef, useState } from 'react'
import { sendChatMessage, type ChatMessage } from '../api/chat'

export function useChat() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    }, [messages, open])

    async function sendMessage() {
        const text = input.trim()
        if (!text || sending) return

        setMessages(prev => [...prev, { role: 'user', content: text }])
        setInput('')
        setSending(true)
        setError(null)

        try {
            const reply = await sendChatMessage(text)
            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
        } catch {
            setError('Something went wrong reaching the assistant. Try again.')
        } finally {
            setSending(false)
        }
    }

    return {
        open,
        setOpen,
        messages,
        input,
        setInput,
        sending,
        error,
        scrollRef,
        sendMessage,
    }
}
