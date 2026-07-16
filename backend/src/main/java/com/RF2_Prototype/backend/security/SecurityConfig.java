package com.RF2_Prototype.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/auth/me").permitAll()
                        .requestMatchers("/images/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                        // public reads
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/departments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                        // reviews: any authenticated user can write/edit/delete their own
                        .requestMatchers(HttpMethod.POST, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/reviews/**").authenticated()

                        // admin writes
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAnyRole("MANAGER", "EMPLOYEE")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAnyRole("MANAGER", "EMPLOYEE")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAnyRole("MANAGER", "EMPLOYEE")

                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyRole("MANAGER", "EMPLOYEE")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyRole("MANAGER", "EMPLOYEE")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAnyRole("MANAGER", "EMPLOYEE")

                        .requestMatchers(HttpMethod.POST, "/api/departments/**").hasAnyRole("MANAGER", "EMPLOYEE")
                        .requestMatchers(HttpMethod.PUT, "/api/departments/**").hasAnyRole("MANAGER", "EMPLOYEE")
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/**").hasAnyRole("MANAGER", "EMPLOYEE")

                        .anyRequest().authenticated()
                )
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // IMPORTANT: must be explicit origin for cookies to work
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));

        // REQUIRED for session cookies
        configuration.setAllowCredentials(true);

        // REQUIRED so browser accepts Set-Cookie header
        configuration.setExposedHeaders(List.of("Set-Cookie"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
