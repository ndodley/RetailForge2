package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.exception.UserNotFoundException;
import com.RF2_Prototype.backend.models.dtos.AuthUserDto;
import com.RF2_Prototype.backend.models.dtos.UserBulkUploadRowDto;
import com.RF2_Prototype.backend.models.entities.User;
import com.RF2_Prototype.backend.repository.UserRepository;
import com.RF2_Prototype.backend.services.iservices.IUserService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class UserService implements IUserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<AuthUserDto> getUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public AuthUserDto getUserById(Integer id) {
        return toDto(getUserEntity(id));
    }

    @Override
    public AuthUserDto createUser(AuthUserDto userDto) {
        User user = new User();
        applyUserValues(user, userDto);
        return toDto(userRepository.save(user));
    }

    @Override
    public int createUsersBulk(List<UserBulkUploadRowDto> rows) {
        List<User> users = rows.stream()
                .map(this::toUserEntity)
                .toList();

        userRepository.saveAll(users);
        return users.size();
    }

    @Override
    public AuthUserDto updateUser(Integer id, AuthUserDto userDto) {
        User user = getUserEntity(id);
        applyUserValues(user, userDto);
        return toDto(userRepository.save(user));
    }

    @Override
    public void deleteUser(Integer id) {
        userRepository.delete(getUserEntity(id));
    }

    private void applyUserValues(User user, AuthUserDto userDto) {
        user.setFirstName(userDto.firstName().trim());
        user.setLastName(userDto.lastName().trim());
        user.setEmail(userDto.email().trim());
        user.setPasswordHash(userDto.passwordHash().trim());
        user.setRole(userDto.role());
        user.setPhoneNumber(userDto.phoneNumber().trim());
        user.setAddress(userDto.address().trim());
        user.setAvatar_path(userDto.avatar_path().trim());
    }

    private User toUserEntity(UserBulkUploadRowDto row) {
        User user = new User();
        user.setFirstName(row.firstName().trim());
        user.setLastName(row.lastName().trim());
        user.setEmail(row.email().trim());
        user.setRole(row.userRole());
        user.setPhoneNumber(row.phoneNumber().trim());
        user.setAddress(row.address().trim());
        return user;
    }

    private User getUserEntity(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    private AuthUserDto toDto(User user) {
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
