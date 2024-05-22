import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from 'src/guard/ws.auth.guard';
import { AuthService } from 'src/auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private rooms: Map<string, string> = new Map();

  constructor(private readonly authService: AuthService) {}

  afterInit() {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.query.authentication as string;
    console.log('connected', client.id);

    const session = await this.authService.validateToken(token);
    if (!session) {
      console.log('Disconnecting');
      client.disconnect();
      return;
    }
    client.join(token);
  }

  handleDisconnect() {
    console.log('client disconnect');
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    console.log('ping from client', client.id);
    client.emit('pong', 'pong');
  }

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: string) {
    console.log('test message from client:', data);
    this.server.emit('room1', 'putio');
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, client.id);
      this.server.emit('roomCreated', room);
      this.handleGetRooms(client);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.rooms.has(room)) {
      client.join(room);
      this.server.to(room).emit('userJoined', client.id);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.rooms.has(room)) {
      client.leave(room);
      this.server.to(room).emit('userLeft', client.id);
    }
  }

  @SubscribeMessage('deleteRoom')
  handleDeleteRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.rooms.has(room) && this.rooms.get(room) === client.id) {
      this.rooms.delete(room);
      this.server.emit('roomDeleted', room);
      this.handleGetRooms(client);
    }
  }

  @SubscribeMessage('getRooms')
  handleGetRooms(@ConnectedSocket() client: Socket) {
    const roomsList = Array.from(this.rooms.entries()).map(([room, owner]) => ({
      room,
      owner,
    }));
    client.emit('roomsList', roomsList);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody()
    { room, message, user }: { room: string; message: string; user: string },
  ) {
    this.server.to(room).emit('message', { user, message });
  }
}
