from django.contrib import admin
from . import views
from django.urls import path

app_name = 'main'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', views.user_login, name='login'),
    path('csrf_token/', views.get_csrf_token, name='csrf-token'),
    path('hotel_rooms/', views.HotelRoomList.as_view(), name='hotel-rooms'),
    path('add_room/', views.add_room, name='add_room'),
    path('delete_room/<int:room_id>/', views.delete_room, name='delete_room'),
    path('update_room/<int:room_id>/', views.update_room, name='update_room'),
    path('update_chat/<int:chatroom_id>/', views.update_chat, name='update_chat'),
    path('send_chat/<int:chatroom_id>/', views.send_chat, name='send_chat'),
    path('verify_token/', views.verify_token, name='verify_token'),

    path('tabletlogin/<int:hotelId>/<int:roomId>/', views.tablet_login, name='tablet_login'),

]
