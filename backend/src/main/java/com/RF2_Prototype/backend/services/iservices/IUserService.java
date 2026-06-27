package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.AuthUserDto;
import com.RF2_Prototype.backend.models.dtos.UserBulkUploadRowDto;

import java.util.List;

public interface IUserService {

    List<AuthUserDto> getUsers();

    AuthUserDto getUserById(Integer id);

    AuthUserDto createUser(AuthUserDto userDto);

    int createUsersBulk(List<UserBulkUploadRowDto> rows);

    AuthUserDto updateUser(Integer id, AuthUserDto userDto);

    void deleteUser(Integer id);
}
