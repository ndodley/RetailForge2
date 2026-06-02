package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.exception.CategoryNotFoundException;
import com.RF2_Prototype.backend.exception.ProductNotFoundException;
import com.RF2_Prototype.backend.models.dtos.ProductBulkUploadRowDto;
import com.RF2_Prototype.backend.models.dtos.ProductDto;
import com.RF2_Prototype.backend.models.dtos.ProductUpsertRequest;
import com.RF2_Prototype.backend.models.entities.Category;
import com.RF2_Prototype.backend.models.entities.Department;
import com.RF2_Prototype.backend.models.entities.Product;
import com.RF2_Prototype.backend.repository.CategoryRepository;
import com.RF2_Prototype.backend.repository.ProductRepository;
import com.RF2_Prototype.backend.services.iservices.IProductService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class ProductService implements IProductService {

    private static final String DEFAULT_IMAGE_PATH = "/images/other_images/dummy_product.jpg";
    private static final String PRODUCT_IMAGE_PREFIX = "/images/product_images/";

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final Path mediaRoot;
    private final Path productImagesDir;
    private final Path otherImagesDir;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            @Value("${app.media.root:${user.dir}/media}") String mediaRoot
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.mediaRoot = Path.of(mediaRoot).toAbsolutePath().normalize();
        this.productImagesDir = this.mediaRoot.resolve("product_images");
        this.otherImagesDir = this.mediaRoot.resolve("other_images");
        ensureMediaDirectories();
    }

    @Override
    public List<ProductDto> getProducts() {
        return productRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public ProductDto getProductById(Integer id) {
        return toDto(getProductEntity(id));
    }

    @Override
    public ProductDto createProduct(ProductUpsertRequest request) {
        Product product = new Product();
        applyProductValues(product, request, null);
        return toDto(productRepository.save(product));
    }

    @Override
    public ProductDto updateProduct(Integer id, ProductUpsertRequest request) {
        Product product = getProductEntity(id);
        String previousImagePath = product.getImagePath();
        applyProductValues(product, request, previousImagePath);
        Product savedProduct = productRepository.saveAndFlush(product);
        deleteProductImageIfReplaced(previousImagePath, savedProduct.getImagePath());
        return toDto(savedProduct);
    }

    @Override
    public int createProductsBulk(List<ProductBulkUploadRowDto> rows) {
        List<Product> products = rows.stream()
                .map(this::toProductEntity)
                .toList();

        productRepository.saveAll(products);
        return products.size();
    }

    @Override
    public void deleteProduct(Integer id) {
        Product product = getProductEntity(id);
        String imagePath = product.getImagePath();
        productRepository.delete(product);
        productRepository.flush();
        deleteProductImageIfOwned(imagePath);
    }

    private void applyProductValues(Product product, ProductUpsertRequest request, String existingImagePath) {
        product.setName(normalizeRequiredText(request.getName(), "Product name is required"));
        product.setBrand(normalizeOptionalText(request.getBrand()));
        product.setRating(normalizeRating(request.getRating()));
        product.setPrice(normalizePrice(request.getPrice()));
        product.setDescription(normalizeRequiredText(request.getDescription(), "Description is required"));
        product.setStock(normalizeStock(request.getStock()));
        product.setCategory(getCategoryEntity(request.getCategoryId()));
        product.setImagePath(resolveImagePath(request.getImage(), existingImagePath));
    }

    private Product toProductEntity(ProductBulkUploadRowDto row) {
        String name = normalizeRequiredText(row.name(), "Each product row requires name, description, price, and stock.");
        String description = normalizeRequiredText(row.description(), "Each product row requires name, description, price, and stock.");
        BigDecimal price = normalizeBulkPrice(row.price());
        Integer stock = normalizeStock(row.stock());
        BigDecimal rating = normalizeRating(row.rating());
        Category category = resolveCategory(row.categoryName(), row.departmentName());

        Product product = new Product();
        product.setName(name);
        product.setBrand(normalizeOptionalText(row.brand()));
        product.setRating(rating);
        product.setPrice(price);
        product.setDescription(description);
        product.setStock(stock);
        product.setCategory(category);
        product.setImagePath(normalizeBulkImagePath(row.imagePath()));
        return product;
    }

    private ProductDto toDto(Product product) {
        Category category = product.getCategory();
        Department department = category == null ? null : category.getDepartment();
        return new ProductDto(
                product.getId(),
                product.getName(),
                product.getBrand(),
                normalizeRating(product.getRating()),
                product.getPrice(),
                product.getDescription(),
                product.getStock(),
                product.getImagePath(),
                category == null ? null : category.getId(),
                category == null ? null : category.getName(),
                department == null ? null : department.getId(),
                department == null ? null : department.getName()
        );
    }

    private Product getProductEntity(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    private Category getCategoryEntity(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
    }

    private Category resolveCategory(String categoryName, String departmentName) {
        String normalizedCategoryName = normalizeRequiredText(categoryName, "Each product row requires category_name.");
        String normalizedDepartmentName = normalizeOptionalText(departmentName);

        List<Category> matches = categoryRepository.findAll().stream()
                .filter(category -> normalizeLookupKey(category.getName()).equals(normalizeLookupKey(normalizedCategoryName)))
                .filter(category -> {
                    if (normalizedDepartmentName == null) {
                        return true;
                    }
                    Department department = category.getDepartment();
                    return department != null
                            && normalizeLookupKey(department.getName()).equals(normalizeLookupKey(normalizedDepartmentName));
                })
                .toList();

        if (matches.isEmpty()) {
            if (normalizedDepartmentName == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "No category found for category_name=\"" + normalizedCategoryName + "\".");
            }

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No category found for category_name=\"" + normalizedCategoryName + "\" and department_name=\"" + normalizedDepartmentName + "\".");
        }

        if (matches.size() > 1) {
            if (normalizedDepartmentName == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Multiple categories found for category_name=\"" + normalizedCategoryName + "\". Add department_name to disambiguate.");
            }

            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Multiple categories found for category_name=\"" + normalizedCategoryName + "\" and department_name=\"" + normalizedDepartmentName + "\".");
        }

        return matches.getFirst();
    }

    private String resolveImagePath(MultipartFile image, String existingImagePath) {
        if (image != null && !image.isEmpty()) {
            return storeProductImage(image, existingImagePath);
        }

        if (existingImagePath != null && !existingImagePath.isBlank()) {
            return existingImagePath;
        }

        return DEFAULT_IMAGE_PATH;
    }

    private String storeProductImage(MultipartFile image, String existingImagePath) {
        ensureMediaDirectories();

        String storedFilename = resolveStoredFilename(image, existingImagePath);
        Path targetPath = productImagesDir.resolve(storedFilename).normalize();
        if (!targetPath.startsWith(productImagesDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid product image filename.");
        }

        try {
            Files.copy(image.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store product image.", exception);
        }

        return PRODUCT_IMAGE_PREFIX + storedFilename;
    }

    private String resolveStoredFilename(MultipartFile image, String existingImagePath) {
        String sanitizedFilename = sanitizeUploadedFilename(image.getOriginalFilename());
        String existingOwnedFilename = getOwnedProductImageFilename(existingImagePath);

        if (existingOwnedFilename != null && existingOwnedFilename.equalsIgnoreCase(sanitizedFilename)) {
            return existingOwnedFilename;
        }

        Path preferredPath = productImagesDir.resolve(sanitizedFilename).normalize();
        if (!Files.exists(preferredPath)) {
            return sanitizedFilename;
        }

        String baseName = getFilenameBase(sanitizedFilename);
        String extension = getFilenameExtension(sanitizedFilename);
        int duplicateIndex = 2;

        while (true) {
            String candidateFilename = baseName + "-" + duplicateIndex + extension;
            Path candidatePath = productImagesDir.resolve(candidateFilename).normalize();
            if (!Files.exists(candidatePath)) {
                return candidateFilename;
            }
            duplicateIndex++;
        }
    }

    private String sanitizeUploadedFilename(String originalFilename) {
        String cleanedFilename = StringUtils.cleanPath(Objects.requireNonNullElse(originalFilename, "product-image"));
        String leafFilename = Objects.requireNonNullElse(StringUtils.getFilename(cleanedFilename), "product-image");
        String normalizedFilename = leafFilename.isBlank() ? "product-image" : leafFilename.trim();

        String extension = getFilenameExtension(normalizedFilename)
                .replaceAll("[^A-Za-z0-9.]", "");
        String baseName = getFilenameBase(normalizedFilename)
                .replaceAll("[/\\\\:*?\"<>|]", "_")
                .replaceAll("\\s+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^[_ .-]+|[_ .-]+$", "");

        if (baseName.isBlank()) {
            baseName = "product-image";
        }

        return baseName + extension;
    }

    private String getFilenameBase(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex <= 0) {
            return filename;
        }
        return filename.substring(0, dotIndex);
    }

    private String getFilenameExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex <= 0 || dotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(dotIndex);
    }

    private void deleteProductImageIfReplaced(String previousImagePath, String nextImagePath) {
        if (previousImagePath == null || previousImagePath.equals(nextImagePath)) {
            return;
        }
        deleteProductImageIfOwned(previousImagePath);
    }

    private void deleteProductImageIfOwned(String imagePath) {
        Path localFilePath = getOwnedProductImageFilePath(imagePath);
        if (localFilePath == null) {
            return;
        }
        boolean isStillReferenced = productRepository.findAll().stream()
                .anyMatch(product -> imagePath.equals(product.getImagePath()));
        if (isStillReferenced) {
            return;
        }

        try {
            Files.deleteIfExists(localFilePath);
        } catch (IOException ignored) {
            // Best-effort cleanup only.
        }
    }

    private Path getOwnedProductImageFilePath(String imagePath) {
        String filename = getOwnedProductImageFilename(imagePath);
        if (filename == null) {
            return null;
        }

        return productImagesDir.resolve(filename).normalize();
    }

    private String getOwnedProductImageFilename(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return null;
        }
        if (DEFAULT_IMAGE_PATH.equals(imagePath)) {
            return null;
        }
        if (!imagePath.startsWith(PRODUCT_IMAGE_PREFIX)) {
            return null;
        }

        String filename = Path.of(imagePath).getFileName().toString();
        if (filename.isBlank()) {
            return null;
        }

        return filename;
    }

    private String normalizeRequiredText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BigDecimal normalizeRating(BigDecimal rating) {
        BigDecimal normalized = rating == null ? BigDecimal.ZERO : rating;
        if (normalized.compareTo(BigDecimal.ZERO) < 0 || normalized.compareTo(BigDecimal.valueOf(5)) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 0 and 5.");
        }
        return normalized.setScale(1, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizePrice(BigDecimal price) {
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than 0.");
        }
        return price.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizeBulkPrice(BigDecimal price) {
        if (price == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Each product row requires name, description, price, and stock.");
        }
        return normalizePrice(price);
    }

    private Integer normalizeStock(Integer stock) {
        if (stock == null || stock < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock must be 0 or greater.");
        }
        return stock;
    }

    private String normalizeBulkImagePath(String imagePath) {
        String normalized = normalizeOptionalText(imagePath);
        return normalized == null ? DEFAULT_IMAGE_PATH : normalized;
    }

    private String normalizeLookupKey(String value) {
        return value == null
                ? ""
                : value.trim().toLowerCase()
                .replace("&", " and ")
                .replaceAll("[^a-z0-9]+", " ")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private void ensureMediaDirectories() {
        try {
            Files.createDirectories(mediaRoot);
            Files.createDirectories(productImagesDir);
            Files.createDirectories(otherImagesDir);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to initialize media storage directories.", exception);
        }
    }
}

