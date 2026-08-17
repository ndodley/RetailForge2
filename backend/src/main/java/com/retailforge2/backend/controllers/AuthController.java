package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.AuthResponse;
import com.retailforge2.backend.models.dtos.LoginRequest;
import com.retailforge2.backend.models.dtos.RegisterRequest;
import com.retailforge2.backend.services.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Controller class to handle authentication-related API endpoints, including registration, login, logout, and fetching the current user's information
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Endpoint for user registration, which accepts a RegisterRequest DTO, validates it, and returns an AuthResponse with the registered user's information or an error message if registration fails
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpSession session) {
        return authService.register(request, session);
    }

    // Endpoint for user login, which accepts a LoginRequest DTO, validates it, and returns an AuthResponse with the logged-in user's information or an error message if login fails
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        System.out.println("AuthController: Login attempt for email: " + request.email());
        return authService.login(request, session);
    }

    // Endpoint for user logout, which invalidates the user's session and returns an AuthResponse confirming the logout
    @PostMapping("/logout")
    public AuthResponse logout(HttpSession session) {
        authService.logout(session);
        return new AuthResponse("Logged out successfully", null);
    }

    // Endpoint to fetch the current authenticated user's information, which returns an AuthResponse with the user's details or an error message if the user is not authenticated
    @GetMapping("/me")
    public AuthResponse me(Authentication authentication) {
        return authService.getCurrentUser(authentication);
    }
}
