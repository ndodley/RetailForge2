package com.RF2_Prototype.backend.services.iservices;

import com.RF2_Prototype.backend.models.dtos.CreatePaymentIntentResponse;
import com.RF2_Prototype.backend.models.dtos.OrderDto;
import com.stripe.exception.StripeException;

import java.math.BigDecimal;

public interface IPaymentService {

    CreatePaymentIntentResponse createPaymentIntent(BigDecimal amountInCents) throws StripeException;

    OrderDto completeCheckout(Integer userId, String address);
}
