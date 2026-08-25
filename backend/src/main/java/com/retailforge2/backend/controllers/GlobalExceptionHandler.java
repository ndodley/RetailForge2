package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.AuthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

// Global exception handler to catch and format validation errors and other exceptions in a consistent way for the AuthController
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Handle IllegalArgumentExceptions thrown by the AuthService and return a 400 Bad Request with the error message
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public AuthResponse handleIllegalArgument(IllegalArgumentException ex) {
        return new AuthResponse(ex.getMessage(), null);
    }

    // Handle concurrent-modification conflicts (e.g. two overlapping checkout attempts
    // racing on the same cart's rows) with a 409 Conflict instead of a raw 500. The
    // pessimistic lock added in CartRepository.findByUserIdForUpdate() prevents most of
    // these at the source by serializing concurrent checkouts of the same cart, but this
    // stays as defense in depth for any other optimistic-locking conflict in the app.
    @ExceptionHandler(OptimisticLockingFailureException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public AuthResponse handleOptimisticLocking(OptimisticLockingFailureException ex) {
        log.warn("Optimistic locking conflict: {}", ex.getMessage());
        return new AuthResponse("This action conflicted with another request in progress. Please try again.", null);
    }

    // Handle duplicate-key / constraint-violation races (e.g. two concurrent "add to cart"
    // requests for the same product both passing the check for "no existing row yet" and
    // then both trying to insert one) with a 409 Conflict instead of a raw 500. The
    // pessimistic lock added in CartService (getOrCreateCartForUpdate) prevents most of
    // these at the source by serializing concurrent cart writes for the same user, but this
    // stays as defense in depth for any other unique-constraint race in the app.
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public AuthResponse handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Data integrity conflict: {}", ex.getMessage());
        return new AuthResponse("This action conflicted with another request in progress. Please try again.", null);
    }

    // Handle validation errors from @Valid annotations in the AuthController and return a 400 Bad Request with a formatted error message for each invalid field
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public AuthResponse handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining("; "));

        return new AuthResponse(message.isBlank() ? "Validation failed." : message, null);
    }
}
