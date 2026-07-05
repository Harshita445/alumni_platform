import cloudinary
import cloudinary.uploader
import cloudinary.api

# Inline Cloudinary credentials
cloud_name = "e7n8ozen"
api_key = "518472249515173"
api_secret = "w2clgD52kqNwelyGicOciKq_RVY"

cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret,
    secure=True,
)

sample_image_url = "https://res.cloudinary.com/demo/image/upload/sample.jpg"

result = cloudinary.uploader.upload(sample_image_url, resource_type="image")
print("Uploaded image URL:", result.get("secure_url"))
print("Uploaded image public ID:", result.get("public_id"))

image_details = cloudinary.api.resource(result["public_id"], resource_type="image")
print("Image metadata:")
print("- width:", image_details.get("width"))
print("- height:", image_details.get("height"))
print("- format:", image_details.get("format"))
print("- bytes:", image_details.get("bytes"))

# f_auto selects the most suitable format automatically for the browser.
# q_auto adjusts image quality automatically to balance file size and visual quality.
transformed_url = cloudinary.CloudinaryImage(result["public_id"]).build_url(format="auto", quality="auto")
print("Done! Click link below to see optimized version of the image. Check the size and the format.")
print("Transformed image URL:", transformed_url)
