"""
Payment Adapter Base Interface

Defines the contract for payment adapters following BSG Platform adapter pattern.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class PaymentAdapter(ABC):
    """Abstract base class for payment adapters."""

    @abstractmethod
    async def create_instant_payment(
        self,
        debit_account_id: str,
        credit_account_id: str,
        transaction_amount: str,
        currency: str,
        payment_order_product_id: Optional[str] = None,
        reference: Optional[str] = None,
        ordering_customer_id: Optional[str] = None,
        additional_fields: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create an instant payment order.

        Args:
            debit_account_id: Source account ID
            credit_account_id: Destination account ID
            transaction_amount: Payment amount
            currency: Currency code (e.g., 'USD', 'EUR')
            payment_order_product_id: Payment product (defaults to ACOTHER)
            reference: Optional payment reference (endToEndReference)
            ordering_customer_id: Optional customer ID initiating the payment
            additional_fields: Optional provider-specific fields

        Returns:
            Payment response with payment ID and status
        """
        pass

    @abstractmethod
    async def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get payment status by ID."""
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Check payment API health status."""
        pass
