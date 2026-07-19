from rest_framework import serializers
from .models import Resource, ResourceCategory, ResourceTag
from django.contrib.auth.models import AnonymousUser


class ResourceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceCategory
        fields = ["id", "name", "slug", "description", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class ResourceTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceTag
        fields = ["id", "name", "slug"]
        read_only_fields = ["id", "slug"]


class ResourceListSerializer(serializers.ModelSerializer):
    category = ResourceCategorySerializer(read_only=True)
    tags = ResourceTagSerializer(many=True, read_only=True)
    bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "external_link",
            "thumbnail",
            "category",
            "tags",
            "resource_type",
            "duration",
            "featured",
            "is_published",
            "bookmarked",
            "created_at",
            "updated_at",
        ]

    def get_bookmarked(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user or isinstance(request.user, AnonymousUser):
            return False
        if not request.user.is_authenticated:
            return False
        return obj.bookmarks.filter(user=request.user).exists()


class ResourceDetailSerializer(serializers.ModelSerializer):
    # Writable via ID input, but serializes to full object representation in responses
    category = serializers.PrimaryKeyRelatedField(
        queryset=ResourceCategory.objects.all()
    )
    tags = serializers.PrimaryKeyRelatedField(
        queryset=ResourceTag.objects.all(),
        many=True,
        required=False,
    )
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True)

    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "slug",
            "short_description",
            "full_description",
            "external_link",
            "thumbnail",
            "category",
            "tags",
            "resource_type",
            "duration",
            "featured",
            "is_published",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_email",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at", "created_by"]

    def to_representation(self, instance):
        # Dynamically switch representation fields for GET output formats
        self.fields["category"] = ResourceCategorySerializer()
        self.fields["tags"] = ResourceTagSerializer(many=True)
        return super().to_representation(instance)
