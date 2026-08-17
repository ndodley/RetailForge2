package com.retailforge2.backend.repository;

import com.retailforge2.backend.models.entities.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Integer> {

    Optional<ChatSession> findByConversationId(String conversationId);

    List<ChatSession> findByUserIdOrderByUpdatedAtDesc(Integer userId);

    List<ChatSession> findByGuestSessionKeyOrderByUpdatedAtDesc(String guestSessionKey);

    void deleteByUserId(Integer userId);

    void deleteByGuestSessionKey(String guestSessionKey);
}
