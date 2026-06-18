from dotenv import dotenv_values
from pathlib import Path


config_path = Path(__file__).parent.parent / ".env"
config = dotenv_values(config_path)
