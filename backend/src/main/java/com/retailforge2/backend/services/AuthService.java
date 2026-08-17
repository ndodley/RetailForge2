package com.retailforge2.backend.services;

import com.retailforge2.backend.models.dtos.AuthResponse;
import com.retailforge2.backend.models.dtos.AuthUserDto;
import com.retailforge2.backend.models.dtos.LoginRequest;
import com.retailforge2.backend.models.dtos.RegisterRequest;
import com.retailforge2.backend.models.entities.User;
import com.retailforge2.backend.models.enums.UserRole;
import com.retailforge2.backend.repository.UserRepository;
import com.retailforge2.backend.security.AuthenticatedUser;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

// Service class to handle authentication logic, including registration, login, and logout
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    // Registration method with validation and authentication
    @Transactional
    public AuthResponse register(RegisterRequest request, HttpSession session) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        UserRole role = parseRole(request.role());

        User user = new User();
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setPhoneNumber(request.phoneNumber().trim());
        user.setAddress(request.address().trim());

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
        );

        storeAuthentication(authentication, session);

        return new AuthResponse("Registration successful", toAuthUserDto(savedUser));
    }

    // Login method with authentication and session management
    public AuthResponse login(LoginRequest request, HttpSession session) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        Authentication authentication;
        try {
            System.out.println("AuthService: Attempting to authenticate user with email: " + normalizedEmail);
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );
            System.out.println("AUTH OK, principal class = " + authentication.getPrincipal().getClass());
        } catch (BadCredentialsException ex) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        storeAuthentication(authentication, session);

        AuthenticatedUser authenticatedUser = (AuthenticatedUser) authentication.getPrincipal();
        return new AuthResponse("Login successful", toAuthUserDto(authenticatedUser.getUser()));
    }

    // Method to get the currently authenticated user
    public AuthResponse getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser authenticatedUser)) {
            return new AuthResponse("No authenticated user", null);
        }

        // The AuthenticatedUser principal is deserialized from the HTTP session (Spring Session JDBC)
        // and reflects a snapshot of the User entity from login time. Profile edits made afterward
        // (e.g. via /api/users/{id}) update the database but do not update this cached principal, so
        // we re-fetch the User fresh here to make sure /api/auth/me (and anything relying on it, like
        // the navbar's account name) always reflects the latest saved profile data.
        User freshUser = userRepository.findById(authenticatedUser.getUser().getId())
                .orElse(authenticatedUser.getUser());

        return new AuthResponse("Authenticated user", toAuthUserDto(freshUser));
    }

    // Logout method to clear the security context and invalidate the session
    public void logout(HttpSession session) {
        SecurityContextHolder.clearContext();
        session.invalidate();
    }

    // Helper method to store authentication in the security context and session
    private void storeAuthentication(Authentication authentication, HttpSession session) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
    }

    // Helper method to parse the role string into a UserRole enum, with error handling for invalid values
    private UserRole parseRole(String roleValue) {
        try {
            return UserRole.valueOf(roleValue.trim().toUpperCase(Locale.ROOT));
        } catch (Exception ex) {
            throw new IllegalArgumentException("Invalid role. Expected customer, manager, or employee.");
        }
    }

    // Helper method to convert a User entity into an AuthUserDto for response purposes
    private AuthUserDto toAuthUserDto(User user) {
        return new AuthUserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getAvatar_path(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
