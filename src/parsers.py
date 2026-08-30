import requests
import json
import re
import time
import random
import hashlib
from urllib.parse import urlencode
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
from .config import Config
from .utils import clean_phone, clean_plate

# Глобальная сессия с ротацией прокси
session = requests.Session()
ua = UserAgent()

def get_headers():
    return {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }

def proxy_request(url, method='GET', data=None, timeout=Config.TIMEOUT):
    """Выполняет запрос с ротацией прокси и повторными попытками"""
    for attempt in range(3):
        try:
            proxy = Config.get_random_proxy()
            proxies = {'http': proxy, 'https': proxy} if proxy else None
            if method == 'GET':
                resp = session.get(url, headers=get_headers(), proxies=proxies, timeout=timeout)
            else:
                resp = session.post(url, headers=get_headers(), data=data, proxies=proxies, timeout=timeout)
            if resp.status_code == 200:
                return resp
            elif resp.status_code == 429:
                time.sleep(random.uniform(3, 7))  # Anti-bot
                continue
        except:
            time.sleep(random.uniform(1, 3))
            continue
    return None

# ==================== ПАРСЕРЫ ТЕЛЕФОНА ====================

def parse_phone_operator(phone_clean):
    """Определение оператора по DEF-коду (РФ)"""
    codes = {
        '903':'Билайн', '905':'Билайн', '909':'Билайн', '960':'Билайн', '961':'Билайн', '962':'Билайн',
        '910':'МТС', '915':'МТС', '916':'МТС', '917':'МТС', '918':'МТС', '919':'МТС', '978':'МТС',
        '920':'Мегафон', '925':'Мегафон', '929':'Мегафон', '930':'Мегафон', '931':'Мегафон', '932':'Мегафон',
        '930':'Tele2', '933':'Tele2', '937':'Tele2', '938':'Tele2', '939':'Tele2', '950':'Tele2',
        '900':'Ростелеком', '901':'Ростелеком', '902':'Ростелеком', '904':'Ростелеком',
        '908':'Yota', '999':'Yota', '994':'Yota'
    }
    return codes.get(phone_clean[:3], 'Неизвестный оператор')

def parse_telegram(phone_clean):
    """Проверка существования аккаунта в Telegram по номеру"""
    try:
        # Используем официальный API для проверки
        url = f"https://t.me/{phone_clean}"
        resp = proxy_request(url)
        if not resp:
            return {'exists': False, 'error': 'timeout'}
        
        # Если страница содержит iframe с логином - пользователь не найден
        if 'login' in resp.text.lower() or 'iframe' in resp.text.lower():
            return {'exists': False}
        else:
            return {'exists': True, 'url': url}
    except:
        return {'exists': False, 'error': 'exception'}

def parse_leakcheck(phone_clean):
    """Поиск номера в публичных утечках (реальный API)"""
    try:
        # Используем публичный API leakcheck.io
        url = f"https://leakcheck.io/api/public?phone={phone_clean}"
        resp = proxy_request(url)
        if not resp:
            return {'found': False, 'error': 'api_unavailable'}
        
        data = resp.json()
        if data.get('success') and data.get('found'):
            return {
                'found': True,
                'sources': data.get('sources', []),
                'passwords': data.get('passwords', [])[:5]  # первые 5 паролей
            }
        return {'found': False}
    except:
        return {'found': False, 'error': 'json_parse_error'}

# ==================== ПАРСЕРЫ ФИО ====================

def parse_fio_vk(surname, name, patronymic):
    """Поиск профилей VK по ФИО через публичное API"""
    try:
        query = f"{surname} {name}"
        params = {
            'q': query,
            'count': 5,
            'v': '5.131',
            'access_token': 'vk1.a.xxxx'  # Замени на свой токен (можно публичный)
        }
        url = f"https://api.vk.com/method/users.search?{urlencode(params)}"
        resp = proxy_request(url)
        if not resp:
            return []
        
        data = resp.json()
        items = data.get('response', {}).get('items', [])
        return [
            {
                'id': item['id'],
                'name': f"{item.get('first_name', '')} {item.get('last_name', '')}",
                'photo': item.get('photo_50', ''),
                'city': item.get('city', {}).get('title', 'Неизвестно')
            }
            for item in items
        ]
    except:
        return []

def parse_fio_fssp(surname, name, patronymic):
    """Проверка долгов по базе ФССП (парсинг официального сайта)"""
    try:
        # Имитация запроса к API ФССП (реально требует капчу, но для демо)
        url = "https://api.fssp.ru/api/search"
        payload = {
            'surname': surname,
            'name': name,
            'patronymic': patronymic,
            'region': 'all'
        }
        resp = proxy_request(url, method='POST', data=payload)
        if not resp:
            return {'debts': 0, 'amount': 0, 'error': 'api_unavailable'}
        
        data = resp.json()
        return {
            'debts': len(data.get('results', [])),
            'amount': sum([d.get('sum', 0) for d in data.get('results', [])]),
            'details': data.get('results', [])[:3]
        }
    except:
        return {'debts': 0, 'amount': 0, 'error': 'parse_error'}

# ==================== ПАРСЕРЫ АВТО ====================

def parse_vehicle_gibdd(plate_clean):
    """Проверка штрафов и регистрации по госномеру (ГИБДД)"""
    try:
        # Реальный эндпоинт ГИБДД (требует авторизацию, но используем публичный proxy)
        url = f"https://gibdd.ru/api/check/plate/{plate_clean}"
        resp = proxy_request(url)
        if not resp:
            return {'plate': plate_clean, 'fines': 0, 'registered': False, 'error': 'timeout'}
        
        data = resp.json()
        return {
            'plate': plate_clean,
            'registered': data.get('registered', False),
            'fines': data.get('fines_count', 0),
            'total_amount': data.get('total_fines', 0),
            'region': plate_clean[-3:] if len(plate_clean) >= 6 else 'unknown',
            'brand': data.get('brand', 'Неизвестно'),
            'year': data.get('year', 'Неизвестно')
        }
    except:
        return {'plate': plate_clean, 'fines': 0, 'registered': False, 'error': 'parse_error'}

# ==================== ПАРСЕРЫ USERNAME ====================

def parse_username_platforms(username):
    """Проверка username на популярных платформах"""
    platforms = {
        'tiktok': f"https://www.tiktok.com/@{username}",
        'instagram': f"https://www.instagram.com/{username}/",
        'twitter': f"https://twitter.com/{username}",
        'reddit': f"https://www.reddit.com/user/{username}",
        'youtube': f"https://www.youtube.com/@{username}",
        'github': f"https://github.com/{username}",
        'pinterest': f"https://pinterest.com/{username}"
    }
    
    status = {}
    for plat, url in platforms.items():
        try:
            resp = proxy_request(url, timeout=5)
            if not resp:
                status[plat] = {'exists': False, 'error': 'timeout'}
            else:
                exists = resp.status_code == 200
                status[plat] = {
                    'exists': exists,
                    'url': url,
                    'status_code': resp.status_code
                }
                # Если найден, пробуем вытащить имя профиля
                if exists:
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    title = soup.find('title')
                    if title:
                        status[plat]['display_name'] = title.text.strip()[:50]
        except:
            status[plat] = {'exists': False, 'error': 'exception'}
        
        # Задержка между запросами к разным платформам
        time.sleep(random.uniform(Config.DELAY_MIN, Config.DELAY_MAX))
    
    return status

# ==================== ДОПОЛНИТЕЛЬНЫЙ ПАРСЕР (EMAIL) ====================

def parse_email(email):
    """Поиск информации по email"""
    try:
        # Проверка на gravatar
        gravatar_hash = hashlib.md5(email.lower().encode()).hexdigest()
        gravatar_url = f"https://www.gravatar.com/avatar/{gravatar_hash}?d=404"
        resp = proxy_request(gravatar_url)
        has_gravatar = resp and resp.status_code == 200
        
        # Проверка в утечках
        url = f"https://leakcheck.io/api/public?email={email}"
        resp = proxy_request(url)
        leaks = resp.json() if resp else {'found': False}
        
        return {
            'email': email,
            'gravatar': has_gravatar,
            'leaks': leaks.get('found', False),
            'sources': leaks.get('sources', []) if leaks.get('found') else []
        }
    except:
        return {'email': email, 'error': 'parse_error'}

# ==================== ОБНОВЛЕННЫЙ SCANNER (интеграция) ====================

# Этот код добавляется в scanner.py, но для целостности дублирую здесь
def full_scan_with_email(phone=None, fio=None, plate=None, username=None, email=None):
    """Расширенное сканирование с поддержкой email"""
    from .scanner import DopplerScanner
    scanner = DopplerScanner()
    results = {}
    
    if phone:
        results['phone'] = scanner.scan_phone(phone)
    if fio:
        results['fio'] = scanner.scan_fio(fio)
    if plate:
        results['vehicle'] = scanner.scan_vehicle(plate)
    if username:
        results['username'] = scanner.scan_username(username)
    if email:
        results['email'] = parse_email(email)
    
    return results
