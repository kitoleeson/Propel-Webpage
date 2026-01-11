# Helper functions
def format_progress_update(string: str, colour: str = "") -> str:
    """Format a progress update string with a checkmark."""
    return f"[{colour}]{string:<40}" if colour else f"{string:<40}"

def get_valid_yes_no(query: str) -> bool:
    """Collects a valid yes/no user input. Returns True for 'yes' and False for 'no'."""
    valid_responses = ['yes', 'y', 'no', 'n']
    response = input(f"{query} (yes/no): ").strip().lower()
    while response not in valid_responses:
        print("Invalid input. Please enter 'yes' or 'no'.")
        response = input(f"{query} (yes/no): ").strip().lower()
    return response in ['yes', 'y']