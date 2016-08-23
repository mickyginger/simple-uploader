# A 'Simple' Uploader using Express, jQuery and AWS

A small app to exemplify how to upload images using jQuery's `$.ajax` method on the frontend and `multer-s3` on the backend.

Requires you to set up the following environment variables:

- `AWS_ACCESS_KEY`
- `AWS_SECRET_KEY`
- `AWS_BUCKET_NAME`

You'll also need to have an AWS account of course and an IAM user with full S3 access.