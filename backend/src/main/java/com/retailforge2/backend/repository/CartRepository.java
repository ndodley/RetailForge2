package com.retailforge2.backend.repository;

import com.retailforge2.backend.models.entities.Cart;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUser_Id(Integer userId);

    // Pessimistic write lock, used specifically by checkout (OrderService.createOrder).
    // Under concurrent checkout attempts for the same user's cart, this makes the second
    // transaction block and wait for the first to commit, instead of both loading the same
    // cart_items rows and racing to delete them - which previously threw
    // ObjectOptimisticLockingFailureException ("Unexpected row count") under load.
    // Ordinary cart reads (viewing/editing the cart) still use the unlocked findByUser_Id
    // above, so this added locking overhead only applies to the checkout path.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cart c where c.user.id = :userId")
    Optional<Cart> findByUserIdForUpdate(@Param("userId") Integer userId);
}
