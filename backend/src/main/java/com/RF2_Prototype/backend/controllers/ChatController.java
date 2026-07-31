package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.exception.AiProviderException;
import com.RF2_Prototype.backend.models.dtos.ChatRequest;
import com.RF2_Prototype.backend.models.dtos.ChatResponse;
import com.RF2_Prototype.backend.services.iservices.IChatService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final IChatService chatService;

    public ChatController(IChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request, HttpServletRequest httpRequest) {
        // Scopes chat memory to this browser's existing session (the same one
        // Spring Session already tracks for every request), so one shopper's
        // conversation history never mixes with another's. No frontend change
        // needed - the session cookie is already sent with every request.
        String conversationId = httpRequest.getSession(true).getId();
        return new ChatResponse(chatService.getReply(request.message(), conversationId));
    }

    @ExceptionHandler(AiProviderException.class)
    public ResponseEntity<String> handleAiProviderException(AiProviderException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
    }
}
