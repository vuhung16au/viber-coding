## Tall ASCII Tower

A tiny, funny Python program that draws a very tall ASCII tower using a lot of explicit `print()` calls.

### Files
- `tower.py`: prints the tower and automatically saves the exact output to `tower.txt`.
- `tower.txt`: generated after running the script; contains the full tower art.

### Requirements
- Python 3.8+ (any recent Python 3 should work)

### Run
```bash
python3 tower.py
```

You will see the tower in your terminal and a new file `tower.txt` will be created in the same directory.

### What it does
1. Builds the tower entirely with many `print()` calls for a retro, textbook-style vibe.
2. Captures the printed output, writes it to `tower.txt`, then echoes it back to the console.

### Customize
- Open `tower.py` and tweak or add more `print()` lines to change the shape.
- The title line and some decorations can be adjusted near the top of `main()`.

### Example
After running, you should have:
```bash
ls -lh tower.txt
```

### Why so many print()?
Because it’s intentionally humorous and nostalgic—like drawing art in early programming classes, one line at a time.


