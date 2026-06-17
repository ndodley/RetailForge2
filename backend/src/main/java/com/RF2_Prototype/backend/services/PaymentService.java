package com.RF2_Prototype.backend.services;

import com.RF2_Prototype.backend.models.dtos.CreatePaymentIntentResponse;
import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.RF2_Prototype.backend.services.iservices.IOrderService;
import com.RF2_Prototype.backend.services.iservices.IPaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {

    private final IOrderService orderService;

    @Value("${stripe.currency}")
    private String currency;

    @Override
    public CreatePaymentIntentResponse createPaymentIntent(BigDecimal amount) throws StripeException {

        Integer amountInCents = amount.multiply(BigDecimal.valueOf(100)).intValueExact();

        Map<String, Object> params = new HashMap<>();
        params.put("amount", amountInCents);
        params.put("currency", currency);
        params.put("automatic_payment_methods", Map.of("enabled", true));

        PaymentIntent intent = PaymentIntent.create(params);

        return new CreatePaymentIntentResponse(intent.getClientSecret());
    }

    @Override
    @Transactional
    public OrderDto completeCheckout(Integer userId, String address) {
        return orderService.createOrder(userId, address);
    }
}
