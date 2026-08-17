package com.retailforge2.backend.services;

import com.retailforge2.backend.exception.UserNotFoundException;
import com.retailforge2.backend.mappers.UserMapper;
import com.retailforge2.backend.models.dtos.AuthUserDto;
import com.retailforge2.backend.models.dtos.UserBulkUploadRowDto;
import com.retailforge2.backend.models.entities.User;
import com.retailforge2.backend.repository.UserRepository;
import com.retailforge2.backend.services.iservices.IUserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class UserService implements IUserService {

    private static final String AVATAR_IMAGE_PREFIX = "/images/avatar_images/";

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final Path mediaRoot;
    private final Path avatarImagesDir;

    public UserService(
            UserRepository userRepository,
            UserMapper userMapper,
            PasswordEncoder passwordEncoder,
            @Value("${app.media.root:${user.dir}/media}") String mediaRoot
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.mediaRoot = Path.of(mediaRoot).toAbsolutePath().normalize();
        this.avatarImagesDir = this.mediaRoot.resolve("avatar_images");
        ensureAvatarDirectory();
    }

    @Override
    public List<AuthUserDto> getUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(userMapper::toDto)
                .toList();
    }

    @Override
    public AuthUserDto getUserById(Integer id) {
        return userMapper.toDto(getUserEntity(id));
    }

    @Override
    public AuthUserDto createUser(AuthUserDto userDto) {
        User user = new User();
        applyUserValues(user, userDto);
        return userMapper.toDto(userRepository.save(user));
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
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public AuthUserDto updateAvatar(Integer id, MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar image is required.");
        }

        User user = getUserEntity(id);
        String previousPath = user.getAvatar_path();

        String newPath = storeUserAvatar(id, avatar);
        user.setAvatar_path(newPath);
        User saved = userRepository.save(user);

        deleteAvatarIfReplaced(previousPath, newPath);

        return userMapper.toDto(saved);
    }

    @Override
    public void deleteUser(Integer id) {
        userRepository.delete(getUserEntity(id));
    }

    private String storeUserAvatar(Integer userId, MultipartFile avatar) {
        ensureAvatarDirectory();

        String extension = getFilenameExtension(sanitizeUploadedFilename(avatar.getOriginalFilename()));
        if (extension.isBlank()) {
            extension = ".jpg";
        }

        String storedFilename = "user-" + userId + "-" + System.currentTimeMillis() + extension;
        Path targetPath = avatarImagesDir.resolve(storedFilename).normalize();
        if (!targetPath.startsWith(avatarImagesDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid avatar filename.");
        }

        try {
            Files.copy(avatar.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store avatar image.", exception);
        }

        return AVATAR_IMAGE_PREFIX + storedFilename;
    }

    private void deleteAvatarIfReplaced(String previousPath, String nextPath) {
        if (previousPath == null || previousPath.equals(nextPath) || !previousPath.startsWith(AVATAR_IMAGE_PREFIX)) {
            return;
        }

        String filename = Path.of(previousPath).getFileName().toString();
        Path localPath = avatarImagesDir.resolve(filename).normalize();
        if (!localPath.startsWith(avatarImagesDir)) {
            return;
        }

        boolean stillReferenced = userRepository.findAll().stream()
                .anyMatch(u -> previousPath.equals(u.getAvatar_path()));
        if (stillReferenced) {
            return;
        }

        try {
            Files.deleteIfExists(localPath);
        } catch (IOException ignored) {
            // best-effort cleanup only
        }
    }

    private String sanitizeUploadedFilename(String originalFilename) {
        String cleanedFilename = StringUtils.cleanPath(Objects.requireNonNullElse(originalFilename, "avatar"));
        String leafFilename = Objects.requireNonNullElse(StringUtils.getFilename(cleanedFilename), "avatar");
        return leafFilename.isBlank() ? "avatar" : leafFilename.trim();
    }

    private String getFilenameExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex <= 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex).replaceAll("[^A-Za-z0-9.]", "");
    }

    private void ensureAvatarDirectory() {
        try {
            Files.createDirectories(mediaRoot);
            Files.createDirectories(avatarImagesDir);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to initialize avatar storage directory.", exception);
        }
    }

    private void applyUserValues(User user, AuthUserDto userDto) {
        user.setFirstName(userDto.firstName().trim());
        user.setLastName(userDto.lastName().trim());
        user.setEmail(userDto.email().trim());
        if (userDto.passwordHash() != null && !userDto.passwordHash().isBlank()) {
            // Despite the field name, this carries a plaintext password from
            // the admin create/edit form (not an actual hash) - it must be
            // encoded here, same as bulk upload and registration do, or the
            // stored value fails BCryptPasswordEncoder's format check on the
            // next login attempt.
            user.setPasswordHash(passwordEncoder.encode(userDto.passwordHash().trim()));
        }
        user.setRole(userDto.role());
        user.setPhoneNumber(userDto.phoneNumber() == null ? null : userDto.phoneNumber().trim());
        user.setAddress(userDto.address() == null ? null : userDto.address().trim());
        if (userDto.avatar_path() != null && !userDto.avatar_path().isBlank()) {
            user.setAvatar_path(userDto.avatar_path().trim());
        }
    }

    private User toUserEntity(UserBulkUploadRowDto row) {
        User user = new User();
        user.setFirstName(row.firstName().trim());
        user.setLastName(row.lastName().trim());
        user.setEmail(row.email().trim());
        // password_hash is NOT NULL - bulk rows carry a plaintext password
        // (same as the single-user create form) that gets hashed here,
        // same encoder AuthService uses for registration/login.
        user.setPasswordHash(passwordEncoder.encode(row.password()));
        user.setRole(row.userRole());
        user.setPhoneNumber(row.phoneNumber().trim());
        user.setAddress(row.address().trim());
        return user;
    }

    private User getUserEntity(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

}
