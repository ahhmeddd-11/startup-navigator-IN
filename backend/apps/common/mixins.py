from rest_framework import status
from common.utils.response import api_response


class CRUDResponseMixin:
    """
    Mixin for ModelViewSet to format responses consistently to:
    {
        "success": True,
        "message": "...",
        "data": { ... }
    }
    """

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(
            success=True,
            message="List retrieved successfully.",
            data=response.data,
            status_code=response.status_code,
        )

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return api_response(
            success=True,
            message="Detail retrieved successfully.",
            data=response.data,
            status_code=response.status_code,
        )

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return api_response(
            success=True,
            message="Created successfully.",
            data=response.data,
            status_code=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        return api_response(
            success=True,
            message="Updated successfully.",
            data=response.data,
            status_code=response.status_code,
        )

    def partial_update(self, request, *args, **kwargs):
        response = super().partial_update(request, *args, **kwargs)
        return api_response(
            success=True,
            message="Updated successfully.",
            data=response.data,
            status_code=response.status_code,
        )

    def destroy(self, request, *args, **kwargs):
        # By default DRF destroy returns 204 No Content.
        # We perform the delete action but return a 200 OK response with a message and success status.
        super().destroy(request, *args, **kwargs)
        return api_response(
            success=True,
            message="Deleted successfully.",
            data=None,
            status_code=status.HTTP_200_OK,
        )
