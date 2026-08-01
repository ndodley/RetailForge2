package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.ChatHistoryMessageDto;
import com.RF2_Prototype.backend.models.dtos.ChatSessionDto;

import java.util.List;

public interface IChatSessionService {

    // Every method takes both userId and guestSessionKey, but exactly one is
    // ever non-null per call - the caller (ChatSessionController) resolves
    // which one applies from the real request, never from client input.
    ChatSessionDto createSession(Integer userId, String guestSessionKey);

    List<ChatSessionDto> listSessions(Integer userId, String guestSessionKey);

    List<ChatHistoryMessageDto> getMessages(String conversationId, Integer userId, String guestSessionKey);

    void clearSession(String conversationId, Integer userId, String guestSessionKey);

    void deleteSession(String conversationId, Integer userId, String guestSessionKey);

    void deleteAllSessions(Integer userId, String guestSessionKey);

    boolean isOwnedByCaller(String conversationId, Integer userId, String guestSessionKey);

    // Best-effort bookkeeping called after a successful reply: bumps recency
    // (via the entity's own @PreUpdate) and, only the first time, derives a
    // title from the customer's message.
    void touchSession(String conversationId, String latestUserMessage);
}
