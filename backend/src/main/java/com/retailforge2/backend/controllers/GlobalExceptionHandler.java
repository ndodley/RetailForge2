package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.AuthResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

// Global exception handler to catch and format validation errors and other exceptions in a consistent way for the AuthController
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle IllegalArgumentExceptions thrown by the AuthService and return a 400 Bad Request with the error message
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public AuthResponse handleIllegalArgument(IllegalArgumentException ex) {
        return new AuthResponse(ex.getMessage(), null);
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
