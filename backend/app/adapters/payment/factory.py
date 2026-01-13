"""
Payment Adapter Factory

Factory for creating payment adapter instances based on configuration.
"""

from typing import Optional
from app.adapters.payment.base import PaymentAdapter
from app.adapters.payment.temenos_adapter import TemenosPaymentAdapter
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Global adapter instance (singleton)
_payment_adapter: Optional[PaymentAdapter] = None


def get_payment_adapter() -> PaymentAdapter:
    """
    Get payment adapter instance (singleton).

    Returns:
        PaymentAdapter instance based on configuration
    """
    global _payment_adapter

    if _payment_adapter is None:
        # Determine adapter type from configuration (currently only Temenos)
        payment_type = getattr(settings, 'PAYMENT_TYPE', 'temenos').lower()

        if payment_type == 'temenos':
            _payment_adapter = TemenosPaymentAdapter()
            logger.info("Using Temenos payment adapter")
        else:
            raise ValueError(f"Unsupported payment type: {payment_type}")

    return _payment_adapter
