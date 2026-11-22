"""Compatibility entry point for the UI2YA browser smoke suite."""
from pathlib import Path
import subprocess

subprocess.run(["node", str(Path(__file__).with_name("smoke.mjs"))], check=True)
