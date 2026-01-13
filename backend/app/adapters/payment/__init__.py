"""Payment adapter module."""

from app.adapters.payment.base import PaymentAdapter
from app.adapters.payment.factory import get_payment_adapter

__all__ = ["PaymentAdapter", "get_payment_adapter"]
