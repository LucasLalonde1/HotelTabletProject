from django.db import models
from django.contrib.auth.models import User, AbstractUser

# Create your models here.


class Hotel(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    schema_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class HotelUser(AbstractUser):
    hotel = models.ForeignKey(Hotel, related_name='users', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.hotel.name if self.hotel else 'No hotel'})"

class Room(models.Model):
    hotel = models.ForeignKey(Hotel, related_name='rooms', on_delete=models.CASCADE)
    room_number = models.IntegerField(null=False)
    is_occupied = models.BooleanField(default=False)
    current_guest_name = models.CharField(max_length=255, blank=True, null=True)
    check_in_date = models.DateTimeField(null=True, blank=True)
    check_out_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('hotel', 'room_number')    
    
    def __str__(self):
        return f'{self.hotel.name} - Room {self.room_number}'

class ChatRoom(models.Model):
    room = models.OneToOneField(Room, on_delete=models.CASCADE, related_name='chat_room')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.room.room_number} - {self.room.hotel.name} Chat Room"
    
class ChatMessage(models.Model):
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_from_guest = models.BooleanField(default=True)

    def __str__(self):
        return f"Message from {'Room' if self.is_from_guest else 'Front Desk'} on {self.timestamp}"

class ServiceOrder(models.Model):
    room = models.ForeignKey(Room, related_name='orders', on_delete=models.CASCADE)
    order_details = models.TextField()
    is_delivered = models.BooleanField(default=False)
    order_time = models.DateTimeField(auto_now_add=True)
    