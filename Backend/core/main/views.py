from rest_framework.views import APIView
from rest_framework.response import Response
from .models import HotelUser, Room, ChatMessage, ChatRoom, Hotel
from .serializers import HotelUserSerializer, HotelSerializer, RoomSerializer, ChatRoomSerializer, ChatMessageSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login
from rest_framework.authtoken.models import Token
from django.middleware.csrf import get_token
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from django.db import IntegrityError
from django.shortcuts import get_object_or_404


User = get_user_model()

class UserList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        users = User.objects.all()
        serializer = HotelUserSerializer(users, many=True)
        return Response(serializer.data)
    
class HotelRoomList(APIView):
    def get(self, request, format=None):
        rooms = Room.objects.all()
        print(rooms)
        serializer = RoomSerializer(rooms, many=True)
        return Response(serializer.data)

@api_view(['POST'])
def signup(request):
    serializer = HotelUserSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data.get('email'),
            first_name=serializer.validated_data.get('first_name'),
            last_name=serializer.validated_data.get('last_name')
        )
        user.set_password(serializer.validated_data['password'])
        user.save()
        return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def user_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        user_serializer = HotelUserSerializer(user)

        if user.hotel:
            rooms = Room.objects.filter(hotel=user.hotel)
            room_serializer = RoomSerializer(rooms, many=True)
        else:
            room_serializer = []

        return Response({
            "message": "Login successful",
            "token": token.key,
            "user": user_serializer.data,
            "rooms": room_serializer.data  # Send rooms data
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


def get_csrf_token(request):
    csrf_token = get_token(request)
    return JsonResponse({'csrf_token': csrf_token})

@api_view(['GET'])
def verify_token(request):
    # Assuming the token is sent in headers
    token_key = request.headers.get('Authorization').split(' ')[1]
    try:
        token = Token.objects.get(key=token_key)
        user = token.user
        return Response({'valid': True, 'user': HotelUserSerializer(user).data})
    except Token.DoesNotExist:
        return Response({'valid': False}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_room(request):
    print(request.data)
    user = request.user
    if not user.hotel:
        return Response({"error": "User does not have an associated hotel."}, status=status.HTTP_400_BAD_REQUEST)

    room_number = request.data.get('room_number')
    if Room.objects.filter(hotel=user.hotel, room_number=room_number).exists():
        return Response({"error": "A room with this number already exists."}, status=status.HTTP_400_BAD_REQUEST)

    data = request.data.copy()
    data['hotel'] = user.hotel.id

    room_serializer = RoomSerializer(data=data)
    if room_serializer.is_valid():
        room = room_serializer.save()

        # Automatically create a ChatRoom for the new Room
        ChatRoom.objects.create(room=room)

        return Response(room_serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(room_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PUT'])
def update_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    print(room)

    # Ensure the user owns the room or has permissions to update it
    if not request.user.is_superuser and room.hotel != request.user.hotel:
        return Response({"error": "You do not have permission to update this room."}, status=status.HTTP_403_FORBIDDEN)

    serializer = RoomSerializer(room, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
def delete_room(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    room.delete()
    return Response({"message": "Room deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])  # Changed to GET since you're fetching data
def update_chat(request, chatroom_id):
    # Ensure you're using the correct model and field names
    chat_room = get_object_or_404(ChatRoom, id=chatroom_id)
    chat_messages = ChatMessage.objects.filter(chat_room=chat_room).order_by('timestamp')
    
    # Serialize your chat messages here. For example:
    messages_data = [{
        "id": message.id,
        "text": message.text,
        "timestamp": message.timestamp,
        "is_from_guest": message.is_from_guest
    } for message in chat_messages]

    return Response(messages_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure the user is authenticated
def send_chat(request, chatroom_id):
    print(request.data)
    chat_room = get_object_or_404(ChatRoom, id=chatroom_id)
    if request.method == 'POST':
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            # Add additional fields if necessary
            serializer.save(chat_room=chat_room, is_from_guest=True)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
def tablet_login(request, hotelId, roomId):
    hotel = get_object_or_404(Hotel, id=hotelId)
    room = get_object_or_404(Room, hotel=hotel, id=roomId)

    if room:
        # Serialize the room data
        room_serializer = RoomSerializer(room)
        
        # Fetch and serialize the chat room data linked to the room
        chat_room = ChatRoom.objects.filter(room=room).first()
        chat_room_serializer = ChatRoomSerializer(chat_room) if chat_room else None
        
        # Prepare the response data
        response_data = {
            "message": "Room found",
            "roomDetails": room_serializer.data,
        }

        # Optionally include chat room details
        if chat_room_serializer:
            response_data["chatRoomDetails"] = chat_room_serializer.data
        print(response_data)
        return Response(response_data, status=status.HTTP_200_OK)

    else:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)