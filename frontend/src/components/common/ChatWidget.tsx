import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChat } from '../../hooks/useChat'
import { useDraggableResizable } from '../../hooks/useDraggableResizable'
import './ChatWidget.css'

function ChatWidget() {
    const {
        open, setOpen, messages, input, setInput, sending, error, scrollRef, sendMessage,
        sessions, showSessionList, setShowSessionList, loadingHistory,
        startNewChat, clearCurrentChat, openSession, removeSession, removeAllSessions,
    } = useChat()
    const { style, onDragMouseDown, onResizeMouseDown } = useDraggableResizable()

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') void sendMessage()
    }

    function handleClearChat() {
        if (messages.length === 0) return
        if (window.confirm('Clear this chat? This removes its messages but keeps it in your recent chats.')) {
            void clearCurrentChat()
        }
    }

    function handleDeleteSession(e: React.MouseEvent, conversationId: string) {
        e.stopPropagation()
        if (window.confirm('Delete this chat? This cannot be undone.')) {
            void removeSession(conversationId)
        }
    }

    function handleDeleteAll() {
        if (window.confirm('Delete all your chats? This cannot be undone.')) {
            void removeAllSessions()
        }
    }

    return (
        <div className="chat-widget">
            {open && (
                <div className="chat-panel" style={style}>
                    <div className="chat-panel-header" onMouseDown={onDragMouseDown}>
                        <span>Store Assistant</span>
                        <div className="chat-panel-header-actions">
                            <button
                                aria-label="Recent chats"
                                title="Recent chats"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => setShowSessionList(v => !v)}
                            >
                                🕘
                            </button>
                            <button
                                aria-label="New chat"
                                title="New chat"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => void startNewChat()}
                            >
                                ➕
                            </button>
                            <button
                                aria-label="Clear chat"
                                title="Clear chat"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={handleClearChat}
                            >
                                🧹
                            </button>
                            <button
                                aria-label="Close chat"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={() => setOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {showSessionList ? (
                        <div className="chat-session-list">
                            <div className="chat-session-list-header">
                                <span>Recent chats</span>
                                {sessions.length > 0 && (
                                    <button className="chat-session-delete-all" onClick={handleDeleteAll}>
                                        Delete all
                                    </button>
                                )}
                            </div>
                            {sessions.length === 0 && (
                                <div className="chat-empty">No chats yet.</div>
                            )}
                            {sessions.map((s) => (
                                <div
                                    key={s.conversationId}
                                    className="chat-session-item"
                                    onClick={() => void openSession(s.conversationId)}
                                >
                                    <span className="chat-session-title">{s.title || 'New chat'}</span>
                                    <button
                                        className="chat-session-delete"
                                        aria-label="Delete chat"
                                        title="Delete chat"
                                        onClick={(e) => handleDeleteSession(e, s.conversationId)}
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="chat-panel-body" ref={scrollRef}>
                                {loadingHistory && (
                                    <div className="chat-empty">Loading chat…</div>
                                )}
                                {!loadingHistory && messages.length === 0 && (
                                    <div className="chat-empty">Ask me about products, orders, or your cart.</div>
                                )}
                                {!loadingHistory && messages.map((m, i) => (
                                    <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
                                        {m.role === 'assistant' ? (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    // Tables render wider than the panel; wrap in a
                                                    // horizontally scrollable strip instead of squashing.
                                                    table: ({ ...props }) => (
                                                        <div className="chat-table-wrap">
                                                            <table {...props} />
                                                        </div>
                                                    ),
                                                    // Never let assistant-provided links navigate the
                                                    // storefront away in the same tab.
                                                    a: ({ ...props }) => (
                                                        <a {...props} target="_blank" rel="noopener noreferrer" />
                                                    ),
                                                }}
                                            >
                                                {m.content}
                                            </ReactMarkdown>
                                        ) : (
                                            m.content
                                        )}
                                    </div>
                                ))}
                                {sending && <div className="chat-bubble chat-bubble--assistant chat-bubble--pending">…</div>}
                                {error && <div className="chat-error">{error}</div>}
                            </div>

                            <div className="chat-input-bar">
                                <input
                                    type="text"
                                    placeholder="How can I help you today?"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={sending || loadingHistory}
                                />
                                <button
                                    className="chat-send-btn"
                                    aria-label="Send message"
                                    onClick={() => void sendMessage()}
                                    disabled={sending || loadingHistory}
                                >
                                    🤖
                                </button>
                            </div>
                        </>
                    )}

                    <div
                        className="chat-resize-handle"
                        onMouseDown={onResizeMouseDown}
                        aria-hidden="true"
                    />
                </div>
            )}

            <button
                className="chat-launcher"
                aria-label={open ? 'Close chat' : 'Open chat'}
                onClick={() => setOpen(v => !v)}
            >
                🤖
            </button>
        </div>
    )
}

export default ChatWidget
