Article image folders belong here.

Use one folder per blog slug:

```text
public/blog/example-slug/
  cover.webp
  diagram-1.webp
  diagram-2.webp
```

Reference images from content files with absolute paths such as
`/blog/example-slug/cover.webp`. The blog content loader validates referenced
images during build so missing assets fail fast.
