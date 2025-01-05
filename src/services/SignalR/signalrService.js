// signalRService.js
import * as signalR from "@microsoft/signalr";

const hubConnection = new signalR.HubConnectionBuilder()
  .withUrl("https://localhost:7288/hubs/product")
  .withAutomaticReconnect()
  .build();

export default hubConnection;
