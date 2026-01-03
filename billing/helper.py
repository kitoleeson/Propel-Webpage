# Helper functions
def format_progress_update(string: str, colour: str = "") -> str:
    """Format a progress update string with a checkmark."""
    return f"[{colour}]{string:<40}" if colour else f"{string:<40}"