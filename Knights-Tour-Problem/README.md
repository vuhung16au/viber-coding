# Knight's Tour Problem

This repository contains different implementations of the Knight's Tour problem, a classic chess puzzle and mathematical problem that demonstrates backtracking and graph theory concepts.

## Repository Contents

- `index.html`: Web-based visualization of the Knight's Tour
- `knights_tour.py`: Python implementation of the solution
- `knights-tour-problem.ipynb`: Jupyter notebook with detailed explanations and visualizations
- Supporting files: GIF and MP4 animations of the tour

## Implementations

You can explore the Knight's Tour problem through three different formats:
1. **Web Version**: Interactive visualization in the browser
2. **Python Script**: Command-line implementation with algorithmic solution
3. **Jupyter Notebook**: Detailed walkthrough with explanations and step-by-step visualization

## The Knight's Tour Problem

The Knight's Tour is a sequence of moves by a knight on a chessboard such that the knight visits every square exactly once. The problem involves finding such a sequence that either:
- Returns to the starting position (closed/cyclic tour)
- Ends on a different square (open tour)

### Algorithm Complexity

- Time Complexity: O(8^N), where N is the total number of squares (N = width × height)
- Space Complexity: O(N), where N is the total number of squares
- For a standard 8×8 chessboard, there are approximately 4×10^51 possible paths to explore

## Heuristic Algorithm

The basic heuristic approach involves:
1. Start from any initial position
2. Generate all valid moves for the knight
3. Choose the next move based on certain criteria
4. Repeat until either:
   - All squares are visited (solution found)
   - No valid moves remain (backtrack or restart)

## Warnsdorff's Heuristic

Warnsdorff's rule (1823) is a more efficient heuristic that significantly improves the solution speed:
1. Always move to the square that has the fewest available next moves
2. In case of a tie, choose randomly among the tied positions

This heuristic dramatically reduces the search space and usually finds a solution in linear time, making it much more practical than the basic backtracking approach.

## Hamiltonian Path/Cycle

The Knight's Tour is a specific instance of a Hamiltonian path problem in graph theory:
- **Hamiltonian Path**: A path that visits every vertex exactly once
- **Hamiltonian Cycle**: A Hamiltonian path that returns to the starting vertex

In the context of the Knight's Tour:
- Each square on the chessboard represents a vertex
- Valid knight moves represent edges between vertices
- A solution to the Knight's Tour is a Hamiltonian path
- A closed Knight's Tour is a Hamiltonian cycle

Finding a Hamiltonian path/cycle in a general graph is NP-complete, but the special structure of the Knight's Tour problem allows for efficient heuristic solutions like Warnsdorff's rule.