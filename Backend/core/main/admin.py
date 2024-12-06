from django.contrib import admin
from .models import Hotel, HotelUser, Room, ChatRoom, ChatMessage, ServiceOrder


# Register your models here.
admin.site.register(Hotel)
admin.site.register(HotelUser)
admin.site.register(Room)
admin.site.register(ChatRoom)
admin.site.register(ChatMessage)
admin.site.register(ServiceOrder)