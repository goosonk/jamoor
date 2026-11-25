import sys
import os

# Pastikan import module api
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from index import app

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
