import sys
import os
engine_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'engine'))
sys.path.insert(0, engine_dir)

from api.main import app
print("FastAPI app imported successfully:", app.title)
