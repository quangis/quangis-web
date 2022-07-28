# Custom middleware
import threading
import logging
import socket
try:
    from django.utils.deprecation import MiddlewareMixin
except ImportError:
    MiddlewareMixin = object
local = threading.local()
class RequestLogFilter(logging.Filter):
    """
    Log filter , The current request thread's request Information saved to the log record Context
    record with formater Information needed .
    """
    def filter(self, record):
        record.hostname =  getattr(local, 'hostname', None)   # Host name
        record.dest_ip =  getattr(local, 'dest_ip', None)     # The server IP
        record.username = getattr(local, 'username', None)    # user
        record.source_ip = getattr(local, 'source_ip', None)  # client IP
        return True
class RequestLogMiddleware(MiddlewareMixin):
    """
    take request The information of is recorded on the current request thread .
    """
    def process_request(self, request):
        local.hostname = socket.gethostname()
        local.dest_ip = socket.gethostbyname(local.hostname)
        local.username = request.user
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', '')
        if x_forwarded_for:
            source_ip = x_forwarded_for.split(',')[0]   # So this is real ip
        else:
            source_ip = request.META.get('REMOTE_ADDR') # Get an agent here ip
        local.source_ip = source_ip
    def process_response(self, request, response):
        return response