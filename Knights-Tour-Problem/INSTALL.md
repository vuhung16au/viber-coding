# Knight's Tour Problem - Installation and Running Instructions

This project includes three different implementations of the Knight's Tour problem:
1. Web-based version (HTML/JavaScript)
2. Python GUI application
3. Jupyter Notebook with animation export

## Web Version (index.html)

The web version requires no installation. Simply:
1. Open the `index.html` file in a modern web browser
2. Click the "Solve Knight's Tour" button to start the visualization
3. Watch as the knight moves across the board, with numbers indicating the order of moves

## Python GUI Version (knights-tour-problem.py)

### Requirements
- Python 3.6 or higher
- Pygame library

### Installation
1. Install Python from [python.org](https://python.org) if not already installed
2. Install Pygame using pip:
```
pip install pygame
```

### Running
1. Open a terminal/command prompt
2. Navigate to the project directory
3. Run the script:
```
python knights-tour-problem.py
```
4. A window will open showing the Knight's Tour visualization
5. The solution will automatically start calculating and displaying
6. Close the window when finished

## Jupyter Notebook Version (knights-tour-problem.ipynb)

### Requirements
- Python 3.6 or higher
- Jupyter Notebook/JupyterLab
- Required Python packages: pygame, imageio, imageio-ffmpeg, numpy, matplotlib

### Installation
1. Install Python from [python.org](https://python.org) if not already installed
2. Install required packages:
```
pip install jupyter notebook pygame imageio imageio-ffmpeg numpy matplotlib
```

### Running
1. Open a terminal/command prompt
2. Navigate to the project directory
3. Start Jupyter Notebook:
```
jupyter notebook
```
4. Click on `knights-tour-problem.ipynb` in the Jupyter file browser
5. Run each cell in sequence using either:
   - Click the "Run" button for each cell
   - Or press Shift+Enter in each cell
6. The notebook will:
   - Generate a visualization of the Knight's Tour
   - Save the animation as both GIF and MP4 files
   - Display the resulting GIF animation in the notebook

## Output Files
When running the Jupyter Notebook version, two animation files will be generated:
- `knights_tour.gif` - Animated GIF of the solution
- `knights_tour.mp4` - MP4 video of the solution