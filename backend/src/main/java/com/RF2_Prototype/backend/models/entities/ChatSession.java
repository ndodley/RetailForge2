package com.RF2_Prototype.backend.models.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// One row per chat thread shown in the "recent chats" list. Owns only the
// conversation's identity/title/owner - the actual messages live in Spring
// AI's own spring_ai_chat_memory table (V13), keyed by conversationId.
@Entity
@Table(name = "chat_sessions")
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "conversation_id", nullable = false, unique = true, length = 36)
    private String conversationId;

    // Exactly one of these is set per row: userId for a logged-in shopper's
    // session, guestSessionKey (their HTTP session id) for a guest's - a
    // guest has no durable identity to own a session by beyond their visit.
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "guest_session_key", length = 64)
    private String guestSessionKey;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ChatSession() {
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getGuestSessionKey() {
        return guestSessionKey;
    }

    public void setGuestSessionKey(String guestSessionKey) {
        this.guestSessionKey = guestSessionKey;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
