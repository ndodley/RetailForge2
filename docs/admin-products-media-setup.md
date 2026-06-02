# Admin Products + Media Setup

## What was added

- Spring Boot product admin API at `/api/products`
- Product create/update with optional multipart image upload
- Product bulk create endpoint at `/api/products/bulk`
- Frontend admin products page at `/admin/products`
- Merged dashboard + upsert tab flow, matching departments/categories
- Filesystem-backed image serving through `/images/**`

## Media folder layout for this project

Use the backend-level `media` folder:

- `backend/media/product_images/` → uploaded product images
- `backend/media/other_images/` → shared fallback assets such as `dummy_product.jpg`

This project now serves those files through Spring using:

- `/images/product_images/<filename>`
- `/images/other_images/<filename>`

## What you still need to do manually

1. Copy the original fallback product image into:
   - `backend/media/other_images/dummy_product.jpg`
2. If you want CSV rows with `image_path` values to work immediately, make sure those paths point to files that exist under `backend/media/...`.
3. Start the backend from the `backend` folder so `${user.dir}/media` resolves to `backend/media`.

## CSV image_path rule

For bulk upload, `image_path` is a public path, for example:

- `/images/product_images/product_Great_Gatsby.jpg`
- `/images/other_images/dummy_product.jpg`

The CSV does **not** upload binary image files. It only stores the image path string.

## Common Spring Boot full-stack pattern

For local development, the common setup is:

1. Store uploaded files outside `src/main/resources`
2. Serve them with a `ResourceHandler`
3. Save only the public path or storage key in the database
4. Keep fallback images in a shared media folder

For production, the most common upgrade is to move media storage to object storage such as S3, Azure Blob Storage, or Cloudinary, while still saving only the returned URL/key in the database.

