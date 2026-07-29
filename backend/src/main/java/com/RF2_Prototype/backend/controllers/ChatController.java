package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.exception.AiProviderException;
import com.RF2_Prototype.backend.models.dtos.ChatRequest;
import com.RF2_Prototype.backend.models.dtos.ChatResponse;
import com.RF2_Prototype.backend.services.iservices.IChatService;
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
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        return new ChatResponse(chatService.getReply(request.message()));
    }

    @ExceptionHandler(AiProviderException.class)
    public ResponseEntity<String> handleAiProviderException(AiProviderException e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
    }
}
