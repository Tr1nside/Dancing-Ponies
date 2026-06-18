import os
from pathlib import Path
from dotenv import dotenv_values

config_path = Path(__file__).parent.parent.parent / ".env"

config = {
    **(dotenv_values(config_path) if config_path.exists() else {}),
    **os.environ,
}
