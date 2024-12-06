import os
import django
from django.contrib.auth.hashers import make_password

# Setting up the Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

# Importing models after setting up Django
from main.models import Hotel, HotelUser

def create_hotel_user():
    # Create or retrieve a Hotel instance
    hotel, created = Hotel.objects.get_or_create(
        name="HotelTest",
        address="123 Sunny Road",
        schema_name="HotelTest"
    )

    if created:
        print("Hotel created successfully")

    # Create a HotelUser instance
    user = HotelUser(
        username="HotelTest",
        email="john@example.com",
        hotel=hotel
    )
    user.password = make_password("HotelTest")  # Securely hash the password
    user.save()

    print(f"HotelUser created successfully: {user}")

if __name__ == "__main__":
    create_hotel_user()
