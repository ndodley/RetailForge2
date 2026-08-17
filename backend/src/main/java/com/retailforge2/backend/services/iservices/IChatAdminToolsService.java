package com.retailforge2.backend.services.iservices;

public interface IChatAdminToolsService {

    // The @Tool metadata Spring AI reads for function-calling lives on the
    // implementation's method (reflection sees the concrete class, not this
    // interface), so this contract is just the plain method signatures.
    String getTopSellingProducts();

    String getCurrentInventory();

    String getOutOfStockProducts();

    String getLowStockProducts();

    String getOrderStatusBreakdown();
}
