import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatMessage, ChatRoom
from channels.db import database_sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f'chat_{self.room_id}'

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
        except Exception as e:
            print(f"Error in WebSocket connect: {e}")

    async def disconnect(self, close_code):
        print("Disconnected")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        is_from_guest = text_data_json['is_from_guest']
        

        # Save the message to the database
        chat_room = await self.get_chat_room(self.room_id)
        chat_message = await self.save_chat_message(chat_room, message, is_from_guest)

        # Broadcast the message to the room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'text': chat_message.text,  # Use 'text' key instead of 'message'
                'id': chat_message.id,
                'timestamp': str(chat_message.timestamp),
                'is_from_guest': chat_message.is_from_guest
            }
        )


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'text': event['text'],  # Match the key with what's expected in the frontend
            'id': event['id'],
            'timestamp': event['timestamp'],
            'is_from_guest': event['is_from_guest']
        }))

    
    @database_sync_to_async
    def get_chat_room(self, room_id):
        return ChatRoom.objects.get(id=room_id)

    @database_sync_to_async
    def save_chat_message(self, chat_room, message, is_from_guest):
        return ChatMessage.objects.create(chat_room=chat_room, text=message, is_from_guest=is_from_guest)

