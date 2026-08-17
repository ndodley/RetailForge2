package com.retailforge2.backend.services.iservices;

import com.retailforge2.backend.models.dtos.CreatePaymentIntentResponse;
import com.retailforge2.backend.models.dtos.OrderDto;
import com.stripe.exception.StripeException;

import java.math.BigDecimal;

public interface IPaymentService {

    CreatePaymentIntentResponse createPaymentIntent(BigDecimal amountInCents) throws StripeException;

    OrderDto completeCheckout(Integer userId, String address);
}
