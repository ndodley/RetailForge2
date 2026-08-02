import { useEffect, useRef, useState } from 'react'
import {
    clearChatSession,
    createChatSession,
    deleteAllChatSessions,
    deleteChatSession,
    getChatSessionMessages,
    listChatSessions,
    sendChatMessage,
    type ChatMessage,
    type ChatSession,
} from '../api/chat'
import { useAuth } from './useAuth'

export function useChat() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const { user, loading: authLoading } = useAuth()

    // Which chat thread is currently open, the full recent-chats list, and
    // whether that list (vs. the live conversation) is what's shown right now.
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [showSessionList, setShowSessionList] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const initialized = useRef(false)

    // Tracks whose sessions are currently loaded ("guest" or a specific user
    // id) so we can tell a real login/logout apart from the initial auth
    // check resolving. undefined = not observed yet.
    const previousIdentityRef = useRef<string | undefined>(undefined)

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    }, [messages, open])

    // First time the widget is opened: resume the most recent chat if one
    // exists, otherwise start a brand-new one. Only runs once per identity
    // (see the login/logout effect below for what happens after that).
    useEffect(() => {
        if (!open || initialized.current) return
        initialized.current = true
        void initialize()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // ChatWidget stays mounted for the whole page session, so logging in or
    // out never remounts this hook - without this, it would keep reusing
    // whatever conversationId belonged to the previous identity (e.g. a
    // guest's session key) after that identity no longer owns it, and every
    // send would fail with a 403 from the backend's ownership check.
    useEffect(() => {
        if (authLoading) return
        const identity = user ? `user:${user.id}` : 'guest'
        const previous = previousIdentityRef.current
        previousIdentityRef.current = identity

        // First resolution on page load, not a transition - the open-triggered
        // effect above handles loading this identity's chats normally.
        if (previous === undefined || previous === identity) return

        // A real login/logout/account-switch: drop everything tied to the
        // old identity and reload fresh for whoever is signed in now.
        setMessages([])
        setConversationId(null)
        setSessions([])
        setShowSessionList(false)
        setError(null)
        if (open) {
            void initialize()
        } else {
            initialized.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading])

    async function initialize() {
        try {
            const existing = await listChatSessions()
            setSessions(existing)
            if (existing.length > 0) {
                await openSession(existing[0].conversationId, existing)
            } else {
                await startNewChat()
            }
        } catch {
            setError('Could not load your chats. Try again.')
        }
    }

    async function refreshSessions(): Promise<ChatSession[]> {
        try {
            const list = await listChatSessions()
            setSessions(list)
            return list
        } catch {
            return sessions
        }
    }

    async function startNewChat() {
        setError(null)
        try {
            const session = await createChatSession()
            setConversationId(session.conversationId)
            setMessages([])
            setShowSessionList(false)
            await refreshSessions()
        } catch {
            setError('Could not start a new chat. Try again.')
        }
    }

    async function openSession(id: string, knownSessions?: ChatSession[]) {
        setLoadingHistory(true)
        setError(null)
        try {
            const history = await getChatSessionMessages(id)
            setConversationId(id)
            setMessages(history)
            setShowSessionList(false)
            if (!knownSessions) {
                await refreshSessions()
            }
        } catch {
            setError('Could not open that chat. Try again.')
        } finally {
            setLoadingHistory(false)
        }
    }

    async function clearCurrentChat() {
        if (!conversationId) return
        setError(null)
        try {
            await clearChatSession(conversationId)
            setMessages([])
            await refreshSessions()
        } catch {
            setError('Could not clear this chat. Try again.')
        }
    }

    async function removeSession(id: string) {
        setError(null)
        try {
            await deleteChatSession(id)
            const remaining = await refreshSessions()
            if (id === conversationId) {
                if (remaining.length > 0) {
                    await openSession(remaining[0].conversationId, remaining)
                } else {
                    await startNewChat()
                }
            }
        } catch {
            setError('Could not delete that chat. Try again.')
        }
    }

    async function removeAllSessions() {
        setError(null)
        try {
            await deleteAllChatSessions()
            setSessions([])
            await startNewChat()
        } catch {
            setError('Could not delete your chats. Try again.')
        }
    }

    async function sendMessage() {
        const text = input.trim()
        if (!text || sending || !conversationId) return

        setMessages(prev => [...prev, { role: 'user', content: text }])
        setInput('')
        setSending(true)
        setError(null)

        try {
            const reply = await sendChatMessage(text, conversationId)
            setMessages(prev => [...prev, { role: 'assistant', content: reply }])
            void refreshSessions() // picks up the auto-derived title / recency bump
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
        sessions,
        showSessionList,
        setShowSessionList,
        loadingHistory,
        startNewChat,
        clearCurrentChat,
        openSession,
        removeSession,
        removeAllSessions,
    }
}
