package com.retailforge2.backend.models.dtos;

// A single stored message when hydrating a past chat session's history in
// the widget. Mirrors the frontend's ChatMessage shape ({role, content})
// exactly, so it can be dropped straight into the same rendering path as a
// live reply. role is always "user" or "assistant" - tool-call/system
// messages that Spring AI also persists in chat memory are filtered out
// before this DTO is built, since those aren't meant to be shown to anyone.
public record ChatHistoryMessageDto(
        String role,
        String content
) {
}
