-- Chat sessions: lets each user (or guest, scoped to their browser session)
-- have multiple named chat threads with the assistant - listed, switchable,
-- and deletable like modern AI chat tools. The actual message content still
-- lives in spring_ai_chat_memory (V13), keyed by conversation_id - this
-- table is just the "which conversations exist and who owns them" index.
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL UNIQUE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    guest_session_key VARCHAR(64),
    title VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX idx_chat_sessions_guest_session_key ON chat_sessions(guest_session_key, updated_at DESC);
