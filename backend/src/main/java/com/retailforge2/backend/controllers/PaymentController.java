package com.retailforge2.backend.controllers;

import com.retailforge2.backend.models.dtos.CreatePaymentIntentRequest;
import com.retailforge2.backend.models.dtos.CreatePaymentIntentResponse;
import com.retailforge2.backend.models.dtos.CompleteCheckoutRequest;
import com.retailforge2.backend.models.dtos.OrderDto;
import com.retailforge2.backend.services.iservices.IPaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<CreatePaymentIntentResponse> createPaymentIntent(
            @RequestBody CreatePaymentIntentRequest request
    ) {
        try {
            CreatePaymentIntentResponse res =
                    paymentService.createPaymentIntent(request.amount());
            return ResponseEntity.ok(res);
        } catch (StripeException e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/complete-checkout")
    public ResponseEntity<OrderDto> completeCheckout(
            @RequestBody CompleteCheckoutRequest request
    ) {
        OrderDto order = paymentService.completeCheckout(
                request.userId(),
                request.address()
        );
        return ResponseEntity.ok(order);
    }
}
