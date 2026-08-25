package com.retailforge2.backend.events;

import java.time.Instant;

// Published to the rf2.auth topic on both login and register attempts,
// success or failure (see AuthService).
public record AuthEvent(
        String email,
        String action,     // "LOGIN" or "REGISTER"
        boolean success,
        Instant occurredAt
) {}
