package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.controllers.ChatOwnerResolver.ChatOwner;
import com.RF2_Prototype.backend.models.dtos.ChatHistoryMessageDto;
import com.RF2_Prototype.backend.models.dtos.ChatSessionDto;
import com.RF2_Prototype.backend.services.iservices.IChatSessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Recent-chats list management: new/list/open/clear/delete/delete-all for
// chat sessions (threads), for both logged-in shoppers and guests. Actual
// message sending still goes through ChatController - this is purely the
// session bookkeeping around it.
@RestController
@RequestMapping("/api/chat/sessions")
public class ChatSessionController {

    private final IChatSessionService chatSessionService;
    private final ChatOwnerResolver chatOwnerResolver;

    public ChatSessionController(IChatSessionService chatSessionService, ChatOwnerResolver chatOwnerResolver) {
        this.chatSessionService = chatSessionService;
        this.chatOwnerResolver = chatOwnerResolver;
    }

    @PostMapping
    public ChatSessionDto createSession(HttpServletRequest httpRequest) {
        ChatOwner owner = chatOwnerResolver.resolve(httpRequest);
        return chatSessionService.createSession(owner.userId(), owner.guestSessionKey());
    }

    @GetMapping
    public List<ChatSessionDto> listSessions(HttpServletRequest httpRequest) {
        ChatOwner owner = chatOwnerResolver.resolve(httpRequest);
        return chatSessionService.listSessions(owner.userId(), owner.guestSessionKey());
    }

    @GetMapping("/{conversationId}/messages")
    public List<ChatHistoryMessageDto> getMessages(@PathVariable String conversationId, HttpServletRequest httpRequest) {
        ChatOwner owner = chatOwnerResolver.resolve(httpRequest);
        return chatSessionService.getMessages(conversationId, owner.userId(), owner.guestSessionKey());
    }

    @PostMapping("/{conversationId}/clear")
    public void clearSession(@PathVariable String conversationId, HttpServletRequest httpRequest) {
        ChatOwner owner = chatOwnerResolver.resolve(httpRequest);
        chatSessionService.clearSession(conversationId, owner.userId(), owner.guestSessionKey());
    }

    @DeleteMapping("/{conversationId}")
    public void deleteSession(@PathVariable String conversationId, HttpServletRequest httpRequest) {
        ChatOwner owner = chatOwnerResolver.resolve(httpRequest);
        chatSessionService.deleteSession(conversationId, owner.userId(), owner.guestSessionKey());
    }

    @DeleteMapping
    public void deleteAllSessions(HttpServletRequest httpRequest) {
        ChatOwner owner = chatOwnerResolver.resolve(httpRequest);
        chatSessionService.deleteAllSessions(owner.userId(), owner.guestSessionKey());
    }
}
