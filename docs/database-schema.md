users: 

id
email
password_hash
role
is_verified
created_at



profiles:

id
user_id
full_name
graduation_year
bio
company
position
location
profile_photo



bookings: 

id
student_id
alumni_id
session_type
scheduled_at
status
meeting_link
price



reviews: 

id
booking_id
rating
comment