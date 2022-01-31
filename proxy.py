from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib import parse
import requests
from os import path
import base64

BACKEND_URI = 'https://www.musician.cafe'

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

   def log_message(self, _format, *_args):
      return
   
   def do_GET(self):
      
      splitted_url = parse.urlsplit(self.path);
      file = splitted_url.path.split('/', 1)[1];
      
      
      if file == 'exit':
         exit();
      else:
      
         # special case of index
         if file == '':
            file = 'index.html'
         
         # check if file exists
         if file == 'proxy':
            
            r = requests.get(base64.b64decode(self.path.split("?")[1]).decode("utf-8"));
            self.send_response(r.status_code)
            self.end_headers()
            for data in r.iter_content(1024):
                self.wfile.write(data);
         elif self.path.startswith('/samples'):
            r = requests.get(BACKEND_URI+self.path);
            self.send_response(r.status_code)
            self.end_headers()
            for data in r.iter_content(1024):
                self.wfile.write(data);
         elif path.exists(file):
            self.send_response(200)
            if '.js' in file:
               self.send_header("Content-type", "text/javascript")
            self.end_headers()
            self.wfile.write(open(file, 'rb').read());
         else:
            print("GET : File not found : "+file);
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"<p>Not Found</p>");
            
   def do_POST(self):
      
      if self.path == '/php/soap.php':
                  
         content_len = int(self.headers.get('Content-Length'))
         post_body = self.rfile.read(content_len)
         
         fake_header = dict()
         fake_header['Content-Type'] = self.headers['Content-Type']
         fake_header['SOAPAction'] = self.headers['SOAPAction']
         fake_header['MessageType'] = self.headers['MessageType']
         fake_header['Origin'] = self.headers['https://www.musician.cafe']
         
         r = requests.post(BACKEND_URI+'/php/soap.php', data = post_body, headers = fake_header);

         self.send_response(r.status_code)

         self.end_headers()

         for data in r.iter_content(1024):
             self.wfile.write(data);

      else:
         print("POST : Not supported...");
         
         self.send_response(404)
         self.end_headers()
         self.wfile.write(b"<p>Not Found</p>");

import time, threading, socket

# Create ONE socket.
addr = ('', 5000)
sock = socket.socket (socket.AF_INET, socket.SOCK_STREAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sock.bind(addr)
sock.listen(5)

# Launch 100 listener threads.
class Thread(threading.Thread):
    def __init__(self, i):
        threading.Thread.__init__(self)
        self.i = i
        self.daemon = True
        self.start()
    def run(self):
        httpd = HTTPServer(addr, SimpleHTTPRequestHandler, False)

        # Prevent the HTTP server from re-binding every handler.
        # https://stackoverflow.com/questions/46210672/
        httpd.socket = sock
        httpd.server_bind = self.server_close = lambda self: None

        httpd.serve_forever()
[Thread(i) for i in range(100)]

while True:
   time.sleep(1)
