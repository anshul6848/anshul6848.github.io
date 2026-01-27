# Fix mojibake in index.html by replacing specific garbled sequences with intended emojis
import os

filepath = "index.html"

# Mapping based on the read_file output
corrections = {
    'ï¿½': '🕉️',       # Kundali (Assuming Om or similar, putting Om for now)
    'ðŸ”¢': '🔢',      # Life Path / Numerology
    'â™ˆ': '♈',       # Zodiac
    'â¤ï¸': '❤️',     # Love
    'ðŸ”®': '🔮',      # Angel
    'ðŸŒ™': '🌙',      # Guidance
    'âœ¨': '✨',       # Manifestation
     # Also cleaning up the share button if present here as well
    'ðŸ“¤': '📤'
}

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

original_content = content
for garbled, emoji in corrections.items():
    content = content.replace(garbled, emoji)

if content != original_content:
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed index.html icons")
else:
    print("No changes needed or patterns not found")
