import os

tools_dir = "tools"
files = [f for f in os.listdir(tools_dir) if f.endswith(".html") and f != "numerology.html"]

# The garbled string sequence we see in the tool output (Mojibake for U+1F4E4)
# It appears as ðŸ“¤ in Windows-1252 for the UTF-8 bytes 0xF0 0x9F 0x93 0xA4
# But we can just search for the unique context "Share this Tool" and replace the preceding span.

for filename in files:
    filepath = os.path.join(tools_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We look for the pattern and replace it. 
    # Since we know the context is stable: <span class="icon">...</span> Share this Tool
    # We can use regex or just basic string replacement if we know the exact string.
    
    # Let's try to replace the known garbled version first if it exists as such in UTF-8 matched string
    # Actually, if the file IS utf-8, and we read it as utf-8, python should see the CORRECT emoji 📤 if it was saved correctly.
    # BUT, the read_file tool showed `ðŸ“¤`. This means the file ON DISK currently contains the bytes for `ðŸ“¤` encoded in UTF-8.
    # i.e. The file was likely opened as ANSI, saved as UTF-8, double encoding the emoji.
    # SO: The file contains the UTF-8 bytes for "ð", "Ÿ", "“", "¤".
    
    # Target string to identify:
    # <span class="icon">ðŸ“¤</span> Share this Tool
    
    target_garbage = 'ðŸ“¤'
    
    if target_garbage in content:
        new_content = content.replace(target_garbage, '📤')
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed {filename}")
    else:
        # Fallback: maybe it's not EXACTLY that string but structurally similar
        import re
        # Match <span class="icon"> (anything) </span> Share this Tool
        # We replace the whole group with <span class="icon">📤</span> Share this Tool
        new_content, count = re.subn(r'<span class="icon">.*?</span> Share this Tool', '<span class="icon">📤</span> Share this Tool', content)
        if count > 0:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Fixed {filename} (Regex)")
        else:
             print(f"No match in {filename}")
