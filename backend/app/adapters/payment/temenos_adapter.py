"""
Temenos Payment Adapter

Implementation for Temenos payment APIs.
"""

import httpx
from typing import Dict, Any, Optional
from app.adapters.payment.base import PaymentAdapter
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class TemenosPaymentAdapter(PaymentAdapter):
    """Temenos-specific payment adapter implementation."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: int = 30
    ):
        """
        Initialize Temenos payment adapter.

        Args:
            base_url: Temenos API base URL (from config if not provided)
            api_key: API key for authentication (from config if not provided)
            timeout: Request timeout in seconds
        """
        self.base_url = base_url or getattr(
            settings,
            'PAYMENT_API_BASE_URL',
            "http://transactingress.northeurope.cloudapp.azure.com/irf-provider-container/api"
        )
        self.api_key = api_key or getattr(settings, 'TEMENOS_DEV_PORTAL_APIKEY', None)
        self.timeout = timeout
        self.instant_payments_endpoint = "/v7.0.0/order/paymentOrders/instantPayments"

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
        """Create instant payment via Temenos API.
        
        Uses minimal required fields for instant payment:
        - debitAccountId: Source account
        - creditAccountId: Destination account
        - transactionAmount: Payment amount
        - paymentCurrency: Currency code
        - paymentOrderProductId: ACOTHER (Account Transfer - Other)
        """

        # Build Temenos API payload with minimal required fields
        payload = {
            "header": {},
            "body": {
                "debitAccountId": debit_account_id,
                "creditAccountId": credit_account_id,
                "transactionAmount": transaction_amount,
                "paymentCurrency": currency,
                "paymentOrderProductId": payment_order_product_id or "ACOTHER"
            }
        }

        # Add optional reference as endToEndReference
        if reference:
            payload["body"]["endToEndReference"] = reference

        # Add optional ordering customer ID
        if ordering_customer_id:
            payload["body"]["orderingCustomerId"] = ordering_customer_id

        # Add any additional fields
        if additional_fields:
            payload["body"].update(additional_fields)

        url = f"{self.base_url}{self.instant_payments_endpoint}"

        logger.info(f"Creating instant payment: {url}")
        logger.debug(f"Payment payload: {payload}")

        try:
            async with httpx.AsyncClient(timeout=self.timeout, verify=False) as client:
                headers = {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }

                # Add API key if available
                if self.api_key:
                    headers["apikey"] = self.api_key

                response = await client.post(
                    url,
                    json=payload,
                    headers=headers
                )

                # Parse response
                try:
                    response_data = response.json()
                except Exception:
                    response_data = {"text": response.text}

                # Check for errors
                if not response.is_success or response_data.get("header", {}).get("status") == "failed":
                    error_details = response_data.get("error", {}).get("errorDetails", [])
                    error_message = "; ".join([
                        f"{err.get('fieldName', 'Field')}: {err.get('message', 'Error')}"
                        for err in error_details
                    ]) if error_details else response_data.get("error", {}).get("message", "Unknown error")

                    logger.error(f"Payment failed: {error_message}")

                    return {
                        "success": False,
                        "error": error_message,
                        "status_code": response.status_code,
                        "full_response": response_data
                    }

                # Success response
                payment_id = response_data.get("header", {}).get("id", "")

                logger.info(f"Payment created successfully: {payment_id}")

                return {
                    "success": True,
                    "payment_id": payment_id,
                    "status": response_data.get("header", {}).get("status", "unknown"),
                    "data": response_data,
                    "status_code": response.status_code
                }

        except httpx.TimeoutException:
            logger.error(f"Timeout creating payment")
            return {
                "success": False,
                "error": "Request timeout - payment API did not respond in time",
                "status_code": 504
            }
        except Exception as e:
            logger.error(f"Error creating payment: {e}", exc_info=True)
            return {
                "success": False,
                "error": f"Payment creation failed: {str(e)}",
                "status_code": 500
            }

    async def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        """Get payment status (placeholder - implement if API supports)."""
        # Note: May need different endpoint for status retrieval
        return {
            "success": True,
            "payment_id": payment_id,
            "status": "COMPLETED"
        }

    async def health_check(self) -> Dict[str, Any]:
        """Check payment API health."""
        try:
            async with httpx.AsyncClient(timeout=5, verify=False) as client:
                response = await client.head(f"{self.base_url}/v7.0.0")
                return {
                    "status": "healthy" if response.is_success else "unhealthy",
                    "connected": response.is_success,
                    "base_url": self.base_url
                }
        except Exception as e:
            logger.error(f"Payment API health check failed: {e}")
            return {
                "status": "unhealthy",
                "connected": False,
                "error": str(e)
            }
