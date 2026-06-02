package com.RF2_Prototype.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.webmvc.autoconfigure.error.ErrorMvcAutoConfiguration;

@SpringBootApplication(exclude = {ErrorMvcAutoConfiguration.class})
public class BackendApplication {

	static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
