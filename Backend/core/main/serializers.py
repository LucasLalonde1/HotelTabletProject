from rest_framework import serializers
from .models import Hotel, HotelUser, Room, ChatRoom, ChatMessage, ServiceOrder

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = ['id', 'name', 'address', 'schema_name']

class HotelUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'hotel']

    def create(self, validated_data):
        user = HotelUser(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class RoomSerializer(serializers.ModelSerializer):
    chat_room_id = serializers.SerializerMethodField()

    hotel_id = serializers.PrimaryKeyRelatedField(
        queryset=Hotel.objects.all(),
        write_only=True,
        source='hotel'
    )

    class Meta:
        model = Room
        fields = ['id', 'room_number', 'is_occupied', 'current_guest_name', 'check_in_date', 'check_out_date', 'hotel_id', 'chat_room_id']
        extra_kwargs = {
            'hotel': {'read_only': True}
        }

    def get_chat_room_id(self, obj):
        # This assumes that every Room has an associated ChatRoom
        chat_room = getattr(obj, 'chat_room', None)
        return chat_room.id if chat_room else None
    
    def create(self, validated_data):
        # This method will be used to create a new Room instance with the associated hotel.
        room = Room.objects.create(**validated_data)
        return room

    def update(self, instance, validated_data):
        # This method can be used to update the Room details, including changing the associated hotel.
        instance.hotel = validated_data.get('hotel', instance.hotel)
        instance.room_number = validated_data.get('room_number', instance.room_number)
        instance.is_occupied = validated_data.get('is_occupied', instance.is_occupied)
        instance.current_guest_name = validated_data.get('current_guest_name', instance.current_guest_name)
        instance.check_in_date = validated_data.get('check_in_date', instance.check_in_date)
        instance.check_out_date = validated_data.get('check_out_date', instance.check_out_date)
        instance.save()
        return instance


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['id', 'room', 'is_active']

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'chat_room', 'text', 'timestamp', 'is_from_guest']


class ServiceOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceOrder
        fields = ['id', 'room', 'order_details', 'is_delivered', 'order_time']
