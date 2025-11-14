import asyncio
from telethon import TelegramClient, events
from telethon.tl.types import UserStatusOnline, UserStatusOffline
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sock import Sock
import threading
import time
import json

# --- НАСТРОЙКИ ---
# Вставь свои api_id и api_hash, полученные с my.telegram.org
API_ID = 9840778  # ЗАМЕНИ НА СВОЙ API_ID
API_HASH = '622b27ea114afb25f41a5aefad092192'  # ЗАМЕНИ НА СВОЙ API_HASH
SESSION_NAME = 'my_bio_session'

# Глобальная переменная для хранения статуса
# 'offline' - начальное значение
telegram_status = {'status': 'offline', 'last_seen': None}
# Список для хранения активных WebSocket соединений
connected_clients = []

# --- ЧАСТЬ USERBOT (TELETHON) ---
client = TelegramClient(SESSION_NAME, API_ID, API_HASH)

async def check_my_status():
    """Асинхронная функция для получения статуса и оповещения клиентов"""
    global telegram_status
    old_status = telegram_status.get('status')
    me = await client.get_me()
    if isinstance(me.status, UserStatusOnline):
        telegram_status = {'status': 'online', 'last_seen': 'now'}
    elif isinstance(me.status, UserStatusOffline):
        telegram_status = {'status': 'offline', 'last_seen': me.status.was_online.isoformat()}
    else:
        # Для других статусов (недавно, на этой неделе и т.д.)
        telegram_status = {'status': 'offline', 'last_seen': 'recently'}
    print(f"[{time.ctime()}] Status updated: {telegram_status['status']}")
    
    # Если статус изменился, оповещаем клиентов
    if telegram_status.get('status') != old_status:
        loop = asyncio.get_running_loop()
        loop.call_soon_threadsafe(broadcast, json.dumps(telegram_status))

@client.on(events.UserUpdate)
async def user_update_handler(event):
    """Обработчик, который срабатывает при изменении статуса"""
    if event.user_id == (await client.get_me()).id:
        await check_my_status()

async def run_telethon():
    """Основной цикл для Telethon"""
    await client.start()
    print("Userbot запущен...")
    await check_my_status()  # Первоначальная проверка
    await client.run_until_disconnected()

# --- ЧАСТЬ СЕРВЕР (FLASK) ---
app = Flask(__name__)
CORS(app)  # Разрешает запросы с твоего сайта к серверу
sock = Sock(app) # Инициализируем WebSocket

@app.route('/status', methods=['GET'])
def get_status():
    """Эндпоинт, который отдает статус сайту"""
    return jsonify(telegram_status)

def run_flask():
    """Запуск Flask сервера"""
    print("Flask server запущен на http://127.0.0.1:5000")
    # host='0.0.0.0' нужен для работы на серверах типа Heroku
    app.run(host='0.0.0.0', port=5000, use_reloader=False)

@sock.route('/ws')
def websocket_endpoint(ws):
    """Обрабатывает WebSocket соединения"""
    print("WebSocket клиент подключен")
    connected_clients.append(ws)
    ws.send(json.dumps(telegram_status)) # Отправляем текущий статус сразу после подключения
    try:
        while True:
            ws.receive() # Просто держим соединение открытым
    except Exception:
        print("WebSocket клиент отключен")
    finally:
        connected_clients.remove(ws)

def broadcast(message):
    """Отправляет сообщение всем подключенным клиентам"""
    for client_ws in connected_clients:
        try:
            client_ws.send(message)
        except Exception:
            # Клиент мог уже отключиться
            pass

def run_flask():
    """Запуск Flask сервера"""
    print("Flask server запущен на http://127.0.0.1:5000")
    # host='0.0.0.0' нужен для работы на серверах типа Heroku
    app.run(host='0.0.0.0', port=5000)

# --- ЗАПУСК ВСЕГО ВМЕСТЕ ---
if __name__ == "__main__":
    # Запускаем Flask в отдельном потоке
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()

    # Запускаем Telethon в основном потоке
    # Используем asyncio.run() для запуска асинхронного кода
    try:
        asyncio.run(run_telethon())
    except (KeyboardInterrupt, SystemExit):
        print("\nВыключаюсь...")
        client.disconnect()
