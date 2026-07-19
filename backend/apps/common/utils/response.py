"""
Shared API response helpers.

Every API view should use these helpers to ensure a consistent
JSON response shape across the entire application.

Response shape:
    {
        "success": bool,
        "message": str,
        "data": dict | list | None
    }
"""
from rest_framework.response import Response


def api_response(
    success: bool,
    message: str = "",
    data=None,
    status_code: int = 200,
) -> Response:
    """
    Return a consistently shaped DRF Response.

    Args:
        success:     Whether the request succeeded.
        message:     Human-readable summary of the outcome.
        data:        Payload to include (dict, list, or None).
        status_code: HTTP status code.

    Returns:
        rest_framework.response.Response
    """
    payload = {
        "success": success,
        "message": message,
        "data": data if data is not None else {},
    }
    return Response(payload, status=status_code)
