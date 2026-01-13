"""
Payment API Endpoints

Provides payment-related endpoints for instant payments.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.adapters.payment import get_payment_adapter
from app.core.logging import get_logger

router = APIRouter(prefix="/payments", tags=["payments"])
logger = get_logger(__name__)


class InstantPaymentRequest(BaseModel):
    """Request model for instant payment creation.
    
    Minimal required fields for Temenos instant payment:
    - debit_account_id: Source account
    - credit_account_id: Destination account  
    - transaction_amount: Payment amount
    - currency: Currency code (default: USD)
    - payment_order_product_id: Defaults to ACOTHER
    """
    debit_account_id: str = Field(..., description="Source account ID")
    credit_account_id: str = Field(..., description="Destination account ID")
    transaction_amount: str = Field(..., description="Payment amount")
    currency: str = Field(default="USD", description="Currency code")
    payment_order_product_id: Optional[str] = Field(None, description="Payment product ID (defaults to ACOTHER)")
    reference: Optional[str] = Field(None, description="Payment reference/description (endToEndReference)")
    ordering_customer_id: Optional[str] = Field(None, description="Optional: Customer ID initiating payment")
    additional_fields: Optional[Dict[str, Any]] = Field(None, description="Additional provider-specific fields")


class PaymentResponse(BaseModel):
    """Response model for payment operations."""
    success: bool
    payment_id: Optional[str] = None
    status: Optional[str] = None
    error: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


@router.post("/instant", response_model=PaymentResponse)
async def create_instant_payment(request: InstantPaymentRequest):
    """
    Create an instant payment order.

    Args:
        request: Instant payment request details

    Returns:
        Payment creation response with payment ID
    """
    try:
        # Get payment adapter
        payment_adapter = get_payment_adapter()

        # Create payment with minimal required fields
        result = await payment_adapter.create_instant_payment(
            debit_account_id=request.debit_account_id,
            credit_account_id=request.credit_account_id,
            transaction_amount=request.transaction_amount,
            currency=request.currency,
            payment_order_product_id=request.payment_order_product_id,
            reference=request.reference,
            ordering_customer_id=request.ordering_customer_id,
            additional_fields=request.additional_fields
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=result.get("status_code", 500),
                detail={
                    "error": result.get("error", "Payment creation failed"),
                    "full_response": result.get("full_response")
                }
            )

        return PaymentResponse(
            success=True,
            payment_id=result.get("payment_id"),
            status=result.get("status"),
            data=result.get("data")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating instant payment: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create payment: {str(e)}"
        )


@router.get("/health")
async def payment_health():
    """Check payment API health status."""
    try:
        payment_adapter = get_payment_adapter()
        health = await payment_adapter.health_check()
        return health
    except Exception as e:
        logger.error(f"Payment health check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
