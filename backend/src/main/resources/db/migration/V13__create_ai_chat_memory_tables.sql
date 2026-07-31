-- Chat memory: persists AI assistant conversation history (multi-turn
-- context) for the chatbot widget. Schema matches exactly what Spring AI's
-- JDBC chat memory repository creates on its own (verified against the
-- actual table it built), now codified here so it's tracked the same way as
-- every other table instead of relying on Spring AI's runtime auto-creation.
--
-- Uses IF NOT EXISTS because this table was already created once by Spring
-- AI's own schema-init (spring.ai.chat.memory.repository.jdbc.initialize-schema
-- was temporarily "always" while confirming the real schema) - this lets
-- Flyway adopt that existing table cleanly, while still working correctly
-- for anyone setting up the database from scratch.
CREATE TABLE IF NOT EXISTS spring_ai_chat_memory (
    conversation_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL')),
    "timestamp" TIMESTAMP NOT NULL,
    sequence_id BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS spring_ai_chat_memory_conversation_id_sequence_id_idx
    ON spring_ai_chat_memory(conversation_id, sequence_id);

CREATE INDEX IF NOT EXISTS spring_ai_chat_memory_conversation_id_timestamp_idx
    ON spring_ai_chat_memory(conversation_id, "timestamp");
