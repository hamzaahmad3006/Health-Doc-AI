import sys
import os

# Add the project root to the path so we can import from the backend folder
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
