"""
Chatbot API Endpoints

Provides chatbot endpoints that use RAG API for all components.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.services.temenos_service import TemenosService
from app.core.logging import get_logger

router = APIRouter(prefix="/components/{component_id}/chatbot", tags=["chatbot"])
logger = get_logger(__name__)

# In-memory session storage (in production, use database)
chat_sessions: Dict[str, Dict[str, Any]] = {}


class ChatSessionRequest(BaseModel):
    """Request model for creating a chat session."""
    context: Optional[Dict[str, Any]] = Field(None, description="Session context")


class ChatMessageRequest(BaseModel):
    """Request model for sending a chat message."""
    session_id: str = Field(..., description="Chat session ID")
    message: str = Field(..., description="User message")


@router.post("/session")
async def create_chat_session(component_id: str, request: ChatSessionRequest):
    """
    Create a new chat session.
    
    Args:
        component_id: Component identifier
        request: Session creation request
        
    Returns:
        Session information
    """
    try:
        import uuid
        session_id = str(uuid.uuid4())
        
        chat_sessions[session_id] = {
            "session_id": session_id,
            "component_id": component_id,
            "context": request.context or {},
            "messages": [],
            "created_at": str(uuid.uuid4())  # Simple timestamp placeholder
        }
        
        return {
            "status": "success",
            "data": {
                "session_id": session_id,
                "component_id": component_id
            }
        }
    except Exception as e:
        logger.error(f"Error creating chat session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
async def send_chat_message(component_id: str, request: ChatMessageRequest):
    """
    Send a chat message and get RAG-based response.

    Uses RAG API for all components with component-specific context.

    Args:
        component_id: Component identifier
        request: Chat message request

    Returns:
        Assistant response
    """
    try:
        logger.info(f"💬 Chatbot query endpoint called - component_id: {component_id}, session_id: {request.session_id}")
        logger.info(f"💬 Message: {request.message[:100] if request.message else 'None'}...")
        logger.info(f"💬 Available sessions: {list(chat_sessions.keys())}")
        logger.info(f"💬 Request body: session_id={request.session_id}, message length={len(request.message) if request.message else 0}")
        
        session_id = request.session_id
        message = request.message
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        if not message:
            raise HTTPException(status_code=400, detail="message is required")

        # Get or create session
        if session_id not in chat_sessions:
            raise HTTPException(status_code=404, detail="Session not found")

        session = chat_sessions[session_id]
        
        # For deployment component, use RAG API directly
        if component_id == "deployment":
            try:
                temenos_service = TemenosService()
            except Exception as e:
                logger.error(f"Failed to initialize TemenosService for deployment: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to initialize RAG service: {str(e)}. Please check RAG API configuration in Settings."
                )
            
            # Build context from conversation history
            context_parts = []
            if session.get("messages"):
                recent_messages = session["messages"][-3:]  # Last 3 messages for context
                context_parts.append("Previous conversation:")
                for msg in recent_messages:
                    if msg.get("role") == "user":
                        context_parts.append(f"User: {msg.get('content', '')}")
                    elif msg.get("role") == "assistant":
                        context_parts.append(f"Assistant: {msg.get('content', '')[:100]}...")
            
            context_parts.append("This is about Temenos cloud deployment, Azure infrastructure, and deployment best practices.")
            context = "\n".join(context_parts)
            
            # Query RAG API with deployment and architecture topics
            # Using valid model IDs from RAG API:
            # - ModularBanking (maps to "Modular" in UI)
            # - TechnologyOverview (maps to "Technology Overview" in UI)
            # - SecurityFramework (maps to "Security" in UI)
            try:
                result = await temenos_service.query_rag(
                    question=message,
                    region="global",
                    rag_model_id="ModularBanking, TechnologyOverview, SecurityFramework",
                    context=context
                )
            except RuntimeError as rag_error:
                error_msg = str(rag_error)
                logger.error(f"RAG API error for deployment: {error_msg}", exc_info=True)
                if "token" in error_msg.lower() or "not configured" in error_msg.lower() or "401" in error_msg or "unauthorized" in error_msg.lower():
                    raise HTTPException(
                        status_code=401,
                        detail="RAG API token is not configured or has expired. Please configure it in Settings to use BSG Guru."
                    )
                raise HTTPException(
                    status_code=500,
                    detail=f"RAG API error: {error_msg}. Please check RAG API configuration in Settings."
                )
            except Exception as rag_error:
                error_msg = str(rag_error)
                logger.error(f"Unexpected RAG API error for deployment: {error_msg}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to query RAG API: {error_msg}. Please check RAG API configuration in Settings."
                )
            
            # Extract answer from response
            # RAG API response format: {"data": {"answer": "...", "sources": [...]}}
            answer_data = result.get("data", {})
            if isinstance(answer_data, dict):
                answer = answer_data.get("answer", "")
                sources = answer_data.get("sources", [])
            else:
                # Fallback if data is not a dict
                answer = str(answer_data) if answer_data else "No answer available"
                sources = []
            
            # Create assistant message
            import uuid
            from datetime import datetime
            assistant_message = {
                "message_id": str(uuid.uuid4()),
                "role": "assistant",
                "content": answer,
                "timestamp": datetime.utcnow().isoformat(),
                "sources": sources
            }
            
            # Add messages to session
            session["messages"].append({
                "message_id": f"user-{uuid.uuid4()}",
                "role": "user",
                "content": message,
                "timestamp": datetime.utcnow().isoformat()
            })
            session["messages"].append(assistant_message)
            
            return {
                "status": "success",
                "data": assistant_message
            }

        # For data-architecture component, use RAG API
        elif component_id == "data-architecture":
            try:
                temenos_service = TemenosService()
            except Exception as e:
                logger.error(f"Failed to initialize TemenosService for data-architecture: {e}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to initialize RAG service: {str(e)}. Please check RAG API configuration in Settings."
                )

            # Build context from conversation history
            context_parts = []
            if session.get("messages"):
                recent_messages = session["messages"][-3:]  # Last 3 messages for context
                context_parts.append("Previous conversation:")
                for msg in recent_messages:
                    if msg.get("role") == "user":
                        context_parts.append(f"User: {msg.get('content', '')}")
                    elif msg.get("role") == "assistant":
                        context_parts.append(f"Assistant: {msg.get('content', '')[:100]}...")

            context_parts.append("This is about Temenos data architecture, data flow patterns, Data Hub, Analytics, and data integration strategies.")
            context = "\n".join(context_parts)

            # Query RAG API with data architecture topics
            # Using valid model IDs from RAG API:
            # - DataHub (maps to "Data Hub" in UI)
            # - Analytics (maps to "Analytics" in UI)
            # - TechnologyOverview (maps to "Technology Overview" in UI)
            try:
                result = await temenos_service.query_rag(
                    question=message,
                    region="global",
                    rag_model_id="DataHub, Analytics, TechnologyOverview",
                    context=context
                )
            except RuntimeError as rag_error:
                error_msg = str(rag_error)
                logger.error(f"RAG API error for data-architecture: {error_msg}", exc_info=True)
                if "token" in error_msg.lower() or "not configured" in error_msg.lower() or "401" in error_msg or "unauthorized" in error_msg.lower():
                    raise HTTPException(
                        status_code=401,
                        detail="RAG API token is not configured or has expired. Please configure it in Settings to use BSG Guru."
                    )
                raise HTTPException(
                    status_code=500,
                    detail=f"RAG API error: {error_msg}. Please check RAG API configuration in Settings."
                )
            except Exception as rag_error:
                error_msg = str(rag_error)
                logger.error(f"Unexpected RAG API error for data-architecture: {error_msg}", exc_info=True)
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to query RAG API: {error_msg}. Please check RAG API configuration in Settings."
                )

            # Extract answer from response
            # RAG API response format: {"data": {"answer": "...", "sources": [...]}}
            answer_data = result.get("data", {})
            if isinstance(answer_data, dict):
                answer = answer_data.get("answer", "")
                sources = answer_data.get("sources", [])
            else:
                # Fallback if data is not a dict
                answer = str(answer_data) if answer_data else "No answer available"
                sources = []

            # Create assistant message
            import uuid
            from datetime import datetime
            assistant_message = {
                "message_id": str(uuid.uuid4()),
                "role": "assistant",
                "content": answer,
                "timestamp": datetime.utcnow().isoformat(),
                "sources": sources
            }

            # Add messages to session
            session["messages"].append({
                "message_id": f"user-{uuid.uuid4()}",
                "role": "user",
                "content": message,
                "timestamp": datetime.utcnow().isoformat()
            })
            session["messages"].append(assistant_message)

            return {
                "status": "success",
                "data": assistant_message
            }


        # Initialize Temenos service for RAG API access
        try:
            temenos_service = TemenosService()
        except Exception as e:
            logger.error(f"Failed to initialize TemenosService: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize RAG service: {str(e)}. Please check RAG API configuration in Settings."
            )

        # Build context from conversation history
        context_parts = []
        if session.get("messages"):
            recent_messages = session["messages"][-3:]  # Last 3 messages for context
            context_parts.append("Previous conversation:")
            for msg in recent_messages:
                if msg.get("role") == "user":
                    context_parts.append(f"User: {msg.get('content', '')}")
                elif msg.get("role") == "assistant":
                    context_parts.append(f"Assistant: {msg.get('content', '')[:100]}...")

        # Add component-specific context and RAG model IDs
        # Mapping UI options to valid API model IDs from RAG Swagger:
        # Generic: TemenosPolicies (Policies), Exchange, InvestorRelations (Temenos Annual Reports)
        # Technology: TechnologyOverview, digital_model (Digital), TechTAP (TAP), FuncPaymentsHub (Payments Hub),
        #            DataHub (Data Hub), Analytics, DataSource (Data Source), ModularBanking (Modular),
        #            SaaSUniformTerms (SaaS), SecurityFramework (Security), ExtensibilityAdvisor (Extensibility)
        # Functionality: FuncTransactGeneric (Transact Generic), FuncTransactWealth (Transact Wealth),
        #                funcWealthTAP (TAP Wealth), Payments, FuncFCM (FCM)
        
        component_configs = {
            "deployment": {
                "context": "This is about Temenos cloud deployment, Azure infrastructure, and deployment best practices.",
                "rag_model_id": "ModularBanking, TechnologyOverview, SecurityFramework"
            },
            "security": {
                "context": "This is about Temenos security features, authentication, authorization, encryption, and security best practices.",
                "rag_model_id": "SecurityFramework, TechnologyOverview"
            },
            "connectivity": {
                "context": "This is about Temenos connectivity, API integrations, microservices communication, and integration patterns.",
                "rag_model_id": "TechnologyOverview, ExtensibilityAdvisor"
            },
            "payment": {
                "context": "This is about Temenos payment processing, payment gateway integrations, transaction handling, and payment workflows.",
                "rag_model_id": "Payments, FuncPaymentsHub, TechnologyOverview"
            },
            "observability": {
                "context": "This is about Temenos observability, monitoring, logging, metrics, tracing, and operational insights.",
                "rag_model_id": "TechnologyOverview, Analytics"
            },
            "api": {
                "context": "This is about Temenos APIs, API design, endpoints, API management, and API best practices.",
                "rag_model_id": "TechnologyOverview, ExtensibilityAdvisor"
            }
        }

        # Use component-specific config or generic Temenos context
        component_config = component_configs.get(
            component_id,
            {
                "context": f"This is about Temenos {component_id} component, its features, capabilities, and best practices.",
                "rag_model_id": "TechnologyOverview"
            }
        )
        context_parts.append(component_config["context"])
        context = "\n".join(context_parts)

        # Query RAG API with component-specific model IDs
        try:
            result = await temenos_service.query_rag(
                question=message,
                region="global",
                rag_model_id=component_config["rag_model_id"],
                context=context
            )
        except RuntimeError as rag_error:
            error_msg = str(rag_error)
            logger.error(f"RAG API error: {error_msg}", exc_info=True)
            # Check if it's a token issue
            if "token" in error_msg.lower() or "not configured" in error_msg.lower() or "401" in error_msg or "unauthorized" in error_msg.lower():
                raise HTTPException(
                    status_code=401,
                    detail="RAG API token is not configured or has expired. Please configure it in Settings to use BSG Guru."
                )
            raise HTTPException(
                status_code=500,
                detail=f"RAG API error: {error_msg}. Please check RAG API configuration in Settings."
            )
        except Exception as rag_error:
            error_msg = str(rag_error)
            logger.error(f"Unexpected RAG API error: {error_msg}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to query RAG API: {error_msg}. Please check RAG API configuration in Settings."
            )

        # Extract answer from response
        # RAG API response format: {"data": {"answer": "...", "sources": [...]}}
        answer_data = result.get("data", {})
        if isinstance(answer_data, dict):
            answer = answer_data.get("answer", "")
            sources = answer_data.get("sources", [])
        else:
            # Fallback if data is not a dict
            answer = str(answer_data) if answer_data else "No answer available"
            sources = []

        # Create assistant message
        import uuid
        from datetime import datetime
        assistant_message = {
            "message_id": str(uuid.uuid4()),
            "role": "assistant",
            "content": answer,
            "timestamp": datetime.utcnow().isoformat(),
            "sources": sources
        }

        # Add messages to session
        session["messages"].append({
            "message_id": f"user-{uuid.uuid4()}",
            "role": "user",
            "content": message,
            "timestamp": datetime.utcnow().isoformat()
        })
        session["messages"].append(assistant_message)

        return {
            "status": "success",
            "data": assistant_message
        }
    except HTTPException:
        raise
    except RuntimeError as e:
        error_msg = str(e)
        # Check if it's a token expiration error (check for 401, expired, or token-related errors)
        if "401" in error_msg or "expired" in error_msg.lower() or "token" in error_msg.lower() or "unauthorized" in error_msg.lower():
            logger.error(f"🔑 RAG token expired in chatbot query: {error_msg}")
            raise HTTPException(
                status_code=401,
                detail="RAG authentication token has expired. Please update the RAG JWT token via Settings API."
            )
        logger.error(f"Error sending chat message: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        logger.error(f"Error sending chat message: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
async def get_chat_history(component_id: str, session_id: str):
    """
    Get chat history for a session.
    
    Args:
        component_id: Component identifier
        session_id: Session ID
        
    Returns:
        Chat history
    """
    try:
        if session_id not in chat_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = chat_sessions[session_id]
        
        return {
            "status": "success",
            "data": {
                "session_id": session_id,
                "messages": session.get("messages", [])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/session/{session_id}")
async def delete_chat_session(component_id: str, session_id: str):
    """
    Delete a chat session.
    
    Args:
        component_id: Component identifier
        session_id: Session ID
    """
    try:
        if session_id in chat_sessions:
            del chat_sessions[session_id]
        
        return {
            "status": "success",
            "message": "Session deleted"
        }
    except Exception as e:
        logger.error(f"Error deleting chat session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

