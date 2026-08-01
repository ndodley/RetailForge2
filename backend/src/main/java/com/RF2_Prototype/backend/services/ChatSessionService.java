package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.models.dtos.ChatHistoryMessageDto;
import com.RF2_Prototype.backend.models.dtos.ChatSessionDto;
import com.RF2_Prototype.backend.models.entities.ChatSession;
import com.RF2_Prototype.backend.repository.ChatSessionRepository;
import com.RF2_Prototype.backend.services.iservices.IChatSessionService;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

// Owns the "which chat threads exist and who owns them" bookkeeping for the
// recent-chats list. The actual message content is never duplicated here -
// it stays in Spring AI's own chat memory (spring_ai_chat_memory), keyed by
// the same conversationId this class hands out and tracks.
@Service
public class ChatSessionService implements IChatSessionService {

    private static final int TITLE_MAX_LENGTH = 60;

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMemory chatMemory;

    public ChatSessionService(ChatSessionRepository chatSessionRepository, ChatMemory chatMemory) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMemory = chatMemory;
    }

    @Override
    @Transactional
    public ChatSessionDto createSession(Integer userId, String guestSessionKey) {
        ChatSession session = new ChatSession();
        session.setConversationId(UUID.randomUUID().toString());
        session.setUserId(userId);
        session.setGuestSessionKey(guestSessionKey);
        return toDto(chatSessionRepository.save(session));
    }

    @Override
    public List<ChatSessionDto> listSessions(Integer userId, String guestSessionKey) {
        return sessionsForOwner(userId, guestSessionKey).stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public List<ChatHistoryMessageDto> getMessages(String conversationId, Integer userId, String guestSessionKey) {
        ChatSession session = requireOwnedSession(conversationId, userId, guestSessionKey);

        List<Message> messages = chatMemory.get(session.getConversationId());
        return messages.stream()
                // Only user/assistant turns are ever shown - tool-call and
                // system messages Spring AI also persists in chat memory are
                // internal plumbing, not something to render in the widget.
                .filter(m -> m.getMessageType() == MessageType.USER || m.getMessageType() == MessageType.ASSISTANT)
                .filter(m -> m.getText() != null && !m.getText().isBlank())
                .map(m -> new ChatHistoryMessageDto(
                        m.getMessageType() == MessageType.USER ? "user" : "assistant",
                        m.getText()))
                .toList();
    }

    @Override
    @Transactional
    public void clearSession(String conversationId, Integer userId, String guestSessionKey) {
        ChatSession session = requireOwnedSession(conversationId, userId, guestSessionKey);
        chatMemory.clear(session.getConversationId());
        // Wiped messages mean the old auto-derived title no longer describes
        // anything real - reset it so the next message derives a fresh one.
        session.setTitle(null);
        chatSessionRepository.save(session);
    }

    @Override
    @Transactional
    public void deleteSession(String conversationId, Integer userId, String guestSessionKey) {
        ChatSession session = requireOwnedSession(conversationId, userId, guestSessionKey);
        chatMemory.clear(session.getConversationId());
        chatSessionRepository.delete(session);
    }

    @Override
    @Transactional
    public void deleteAllSessions(Integer userId, String guestSessionKey) {
        List<ChatSession> sessions = sessionsForOwner(userId, guestSessionKey);
        for (ChatSession session : sessions) {
            chatMemory.clear(session.getConversationId());
        }
        if (userId != null) {
            chatSessionRepository.deleteByUserId(userId);
        } else {
            chatSessionRepository.deleteByGuestSessionKey(guestSessionKey);
        }
    }

    @Override
    public boolean isOwnedByCaller(String conversationId, Integer userId, String guestSessionKey) {
        return chatSessionRepository.findByConversationId(conversationId)
                .map(session -> isOwnedBy(session, userId, guestSessionKey))
                .orElse(false);
    }

    @Override
    @Transactional
    public void touchSession(String conversationId, String latestUserMessage) {
        // Best-effort: a message can still succeed even if, for some reason,
        // there's no matching session row (e.g. an old pre-sessions client).
        chatSessionRepository.findByConversationId(conversationId).ifPresent(session -> {
            if (session.getTitle() == null || session.getTitle().isBlank()) {
                session.setTitle(deriveTitle(latestUserMessage));
            }
            chatSessionRepository.save(session); // @PreUpdate bumps updatedAt for recency ordering
        });
    }

    private List<ChatSession> sessionsForOwner(Integer userId, String guestSessionKey) {
        return userId != null
                ? chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                : chatSessionRepository.findByGuestSessionKeyOrderByUpdatedAtDesc(guestSessionKey);
    }

    private ChatSession requireOwnedSession(String conversationId, Integer userId, String guestSessionKey) {
        ChatSession session = chatSessionRepository.findByConversationId(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat session not found."));
        if (!isOwnedBy(session, userId, guestSessionKey)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This chat session does not belong to you.");
        }
        return session;
    }

    private boolean isOwnedBy(ChatSession session, Integer userId, String guestSessionKey) {
        if (userId != null) {
            return userId.equals(session.getUserId());
        }
        if (guestSessionKey != null) {
            return guestSessionKey.equals(session.getGuestSessionKey());
        }
        return false;
    }

    private String deriveTitle(String message) {
        if (message == null || message.isBlank()) {
            return "New chat";
        }
        String trimmed = message.trim().replaceAll("\\s+", " ");
        if (trimmed.length() <= TITLE_MAX_LENGTH) {
            return trimmed;
        }
        return trimmed.substring(0, TITLE_MAX_LENGTH).trim() + "…";
    }

    private ChatSessionDto toDto(ChatSession session) {
        return new ChatSessionDto(
                session.getId(),
                session.getConversationId(),
                session.getTitle(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }
}
