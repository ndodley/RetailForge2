package com.RF2_Prototype.backend.services.iservices;

public interface IChatService {

    // conversationId scopes memory to one shopper's conversation (their
    // browser session) so different visitors' chat histories never mix.
    String getReply(String message, String conversationId);
}
