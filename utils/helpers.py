from datetime import datetime
from typing import Any

def log_agent_action(agent_name: str, action: str, detail: str = "") -> None:
    timestamp = datetime.now().strftime("%H:%M:%S")
    separator = "-" * 50
    print(f"\n{separator}")
    print(f"[{timestamp}] 🤖 AGENT: {agent_name.upper()}")
    print(f"[{timestamp}] ⚡ ACTION: {action}")
    if detail:
        print(f"[{timestamp}] 📋 DETAIL: {detail}")
    print(f"{separator}\n")

def format_posts_for_review(posts: list) -> str:
    if not posts:
        return "No posts generated yet."
    
    formatted = ""
    for i, post in enumerate(posts, start=1):
        formatted += f"\n{'='*40}\n"
        formatted += f"POST {i}:\n"
        formatted += f"{post}\n"
    
    formatted += f"\n{'='*40}\n"
    return formatted

def validate_state_field(state: dict, field: str, agent_name: str) -> bool:
    if field not in state or not state[field]:
        print(f"⚠️  WARNING: {agent_name} expected '{field}' in state but it was empty or missing.")
        return False
    return True

def create_error_message(agent_name: str, error: Exception) -> str:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"[{timestamp}] ERROR in {agent_name}: {str(error)}"

def parse_numbered_list(text: str) -> list:
    lines = text.strip().split("\n")
    results = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line[0].isdigit() and len(line) > 2:
            if line[1] in [".", ")", ":"]:
                line = line[2:].strip()
        if line:
            results.append(line)
    return results