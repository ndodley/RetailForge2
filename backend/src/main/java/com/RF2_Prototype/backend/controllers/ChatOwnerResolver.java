package com.RF2_Prototype.backend.controllers;

import com.RF2_Prototype.backend.security.AuthenticatedUser;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

// Resolves who "owns" a chat session for the current request: a real userId
// when logged in, or the caller's own HTTP session id as a stand-in identity
// when they're a guest (so guests still get a working recent-chats list for
// their visit, without needing an account). Exactly one of the two is ever
// non-null. Centralized here so ChatController and ChatSessionController
// can't drift out of sync on how ownership is determined.
@Component
public class ChatOwnerResolver {

    public record ChatOwner(Integer userId, String guestSessionKey) {
    }

    public ChatOwner resolve(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser authenticatedUser) {
            return new ChatOwner(authenticatedUser.getUser().getId(), null);
        }
        return new ChatOwner(null, request.getSession(true).getId());
    }
}
