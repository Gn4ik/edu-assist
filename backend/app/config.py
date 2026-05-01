import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
DOTENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=DOTENV_PATH)

# File limits
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Ollama
OLLAMA_HOST = os.getenv("OLLAMA_HOST")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT"))

# Chunking
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 200

# Cache
CACHE_DIR = BASE_DIR / ".cache"
CACHE_SIZE_MB = 100
