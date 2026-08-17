package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.AuthUserDto;
import com.retailforge2.backend.models.dtos.BulkOperationResultDto;
import com.retailforge2.backend.models.dtos.UserBulkUploadRequestDto;
import com.retailforge2.backend.services.iservices.IUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<AuthUserDto> getUsers() {
        return userService.getUsers();
    }

    @GetMapping("/{id}")
    public AuthUserDto getUser(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public AuthUserDto createUser(@Valid @RequestBody AuthUserDto authUserDto) {
        return userService.createUser(authUserDto);
    }

    @PostMapping("/bulk")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public BulkOperationResultDto createUsersBulk(@Valid @RequestBody UserBulkUploadRequestDto requestDto) {
        return new BulkOperationResultDto(userService.createUsersBulk(requestDto.rows()));
    }

    @PutMapping("/{id}")
    public AuthUserDto updateUser(@PathVariable Integer id, @Valid @RequestBody AuthUserDto authUserDto) {
        return userService.updateUser(id, authUserDto);
    }

    @PutMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AuthUserDto updateAvatar(@PathVariable Integer id, @RequestParam("avatar") MultipartFile avatar) {
        return userService.updateAvatar(id, avatar);
    }

    @DeleteMapping("/{id}")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
    }
}
