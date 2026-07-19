from django.utils.text import slugify


def generate_unique_slug(instance, source_field_name: str, slug_field_name: str = "slug") -> None:
    """
    Generates a unique slug for a model instance if not already provided.
    Appends a numeric suffix if a collision is found in the database.
    """
    slug_val = getattr(instance, slug_field_name)
    if not slug_val:
        source_val = getattr(instance, source_field_name)
        if not source_val:
            source_val = "unnamed"
        base_slug = slugify(source_val)
        if not base_slug:
            base_slug = "unnamed"

        slug_val = base_slug
        model_class = instance.__class__
        num = 1

        # Check for uniqueness in the database (exclude the current instance)
        while model_class.objects.filter(**{slug_field_name: slug_val}).exclude(pk=instance.pk).exists():
            slug_val = f"{base_slug}-{num}"
            num += 1

        setattr(instance, slug_field_name, slug_val)
