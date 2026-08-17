package com.retailforge2.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class MediaStorageConfig implements WebMvcConfigurer {

    private final String mediaRoot;

    public MediaStorageConfig(@Value("${app.media.root:${user.dir}/media}") String mediaRoot) {
        this.mediaRoot = mediaRoot;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String mediaLocation = Path.of(mediaRoot).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/images/**")
                .addResourceLocations(mediaLocation);
    }
}

