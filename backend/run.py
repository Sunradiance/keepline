import os
import sys

if sys.platform == 'win32':
    os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app import create_app
from app.config import Config


def main():
    for w in Config.validate():
        print(f'  ⚠ {w}')
    if not Config.validate():
        print('  ✓ All APIs configured\n')
    print(f'Keepline → http://localhost:{Config.PORT}\n')
    create_app().run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG, threaded=True)


if __name__ == '__main__':
    main()