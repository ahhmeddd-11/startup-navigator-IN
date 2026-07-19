from rest_framework import serializers
from .models import Article, KnowledgeCategory, KnowledgeTag


class KnowledgeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeCategory
        fields = ["id", "name", "slug", "description", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]


class KnowledgeTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeTag
        fields = ["id", "name", "slug"]
        read_only_fields = ["id", "slug"]


class ArticleListSerializer(serializers.ModelSerializer):
    category = KnowledgeCategorySerializer(read_only=True)
    tags = KnowledgeTagSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "reading_time",
            "featured_image",
            "category",
            "tags",
            "is_published",
            "featured",
            "author_name",
            "bookmarked",
            "created_at",
            "updated_at",
        ]

    def get_bookmarked(self, obj) -> bool:
        request = self.context.get("request")
        from django.contrib.auth.models import AnonymousUser
        if not request or not request.user or isinstance(request.user, AnonymousUser):
            return False
        if not request.user.is_authenticated:
            return False
        return obj.bookmarks.filter(user=request.user).exists()


class ArticleDetailSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=KnowledgeCategory.objects.all()
    )
    tags = serializers.PrimaryKeyRelatedField(
        queryset=KnowledgeTag.objects.all(),
        many=True,
        required=False,
    )
    author_name = serializers.CharField(source="author.full_name", read_only=True)
    author_email = serializers.EmailField(source="author.email", read_only=True)
    bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "summary",
            "content",
            "reading_time",
            "featured_image",
            "category",
            "tags",
            "is_published",
            "featured",
            "meta_title",
            "meta_description",
            "author",
            "author_name",
            "author_email",
            "bookmarked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at", "author"]

    def get_bookmarked(self, obj) -> bool:
        request = self.context.get("request")
        from django.contrib.auth.models import AnonymousUser
        if not request or not request.user or isinstance(request.user, AnonymousUser):
            return False
        if not request.user.is_authenticated:
            return False
        return obj.bookmarks.filter(user=request.user).exists()

    def to_representation(self, instance):
        self.fields["category"] = KnowledgeCategorySerializer()
        self.fields["tags"] = KnowledgeTagSerializer(many=True)
        return super().to_representation(instance)
