import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChat } from '../../hooks/useChat'
import { useDraggableResizable } from '../../hooks/useDraggableResizable'
import './ChatWidget.css'

function ChatWidget() {
    const { open, setOpen, messages, input, setInput, sending, error, scrollRef, sendMessage } = useChat()
    const { style, onDragMouseDown, onResizeMouseDown } = useDraggableResizable()

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') void sendMessage()
    }

    return (
        <div className="chat-widget">
            {open && (
                <div className="chat-panel" style={style}>
                    <div className="chat-panel-header" onMouseDown={onDragMouseDown}>
                        <span>Store Assistant</span>
                        <button
                            aria-label="Close chat"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="chat-panel-body" ref={scrollRef}>
                        {messages.length === 0 && (
                            <div className="chat-empty">Ask me about products, orders, or your cart.</div>
                        )}
                        {messages.map((m, i) => (
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
                            disabled={sending}
                        />
                        <button
                            className="chat-send-btn"
                            aria-label="Send message"
                            onClick={() => void sendMessage()}
                            disabled={sending}
                        >
                            🤖
                        </button>
                    </div>

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
