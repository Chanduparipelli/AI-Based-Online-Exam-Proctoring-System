from fastapi import WebSocket
from ai.websocket_proctor import handle_proctor_ws

async def proctor_socket(websocket: WebSocket):
    await handle_proctor_ws(websocket)
