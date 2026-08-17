package com.retailforge2.backend.controllers;

import com.retailforge2.backend.controllers.ChatOwnerResolver.ChatOwner;
import com.retailforge2.backend.exception.AiProviderException;
import com.retailforge2.backend.models.dtos.ChatRequest;
import com.retailforge2.backend.models.dtos.ChatResponse;
import com.retailforge2.backend.services.iservices.IChatService;
import com.retailforge2.backend.services.iservices.IChatSessionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final IChatService chatService;
    private final IChatSessionService chatSessionService;
    private final ChatOwnerResolver chatOwnerResolver;

    public ChatController(IChatService chatService, IChatSessionService chatSessionService, ChatOwnerResolver chatOwnerResolver) {
        this.chatService = chatService;
        this.chatSessionService = chatSessionService;
        this.chatOwnerResolver = chatOwnerResolver;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request, HttpServletRequest httpRequest) {
        ChatOwner owner = chatOwnerResolver.resolve(httpRequest);

        // The frontend always creates a session via POST /api/chat/sessions
        // first and sends its conversationId with every message - verify it
        // actually belongs to this caller rather than trusting it blindly,
        // so nobody can post messages into someone else's chat thread.
        if (!chatSessionService.isOwnedByCaller(request.conversationId(), owner.userId(), owner.guestSessionKey())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This chat session does not belong to you.");
        }

        String reply = chatService.getReply(request.message(), request.conversationId());
        chatSessionService.touchSession(request.conversationId(), request.message());
        return new ChatResponse(reply);
    }

    @ExceptionHandler(AiProviderException.class)
    public ResponseEntity<String> handleAiProviderException(AiProviderException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
    }
}
