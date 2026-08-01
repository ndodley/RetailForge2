package com.RF2_Prototype.backend.repository;

import com.RF2_Prototype.backend.models.entities.ChatSession;
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
