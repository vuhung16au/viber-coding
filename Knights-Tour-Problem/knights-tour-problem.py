
import pygame
import time

# Initialize Pygame
pygame.init()

# Constants
BOARD_SIZE = 8
SQUARE_SIZE = 60
WINDOW_SIZE = BOARD_SIZE * SQUARE_SIZE
DELAY = 0.2  # Delay between moves (in seconds) for animation

# Colors
WHITE = (255, 255, 255)
BROWN = (139, 69, 19)
LIGHT_BROWN = (222, 184, 135)
YELLOW = (255, 235, 59)
BLACK = (0, 0, 0)

# Set up the display
screen = pygame.display.set_mode((WINDOW_SIZE, WINDOW_SIZE))
pygame.display.set_caption("Knight's Tour Solver")

# Load knight image (you can replace this with a path to a knight image)
# For simplicity, we'll draw a circle if no image is available
try:
    knight_image = pygame.image.load("knight.png")
    knight_image = pygame.transform.scale(knight_image, (SQUARE_SIZE - 10, SQUARE_SIZE - 10))
except:
    knight_image = None

# Font for displaying move numbers
font = pygame.font.Font(None, 24)

# Possible knight moves (L-shape)
moves = [
    (2, 1), (2, -1), (-2, 1), (-2, -1),
    (1, 2), (1, -2), (-1, 2), (-1, -2)
]

# Board to keep track of moves
board = [[-1 for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]

# Check if a position is valid
def is_valid(x, y):
    return 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE and board[x][y] == -1

# Get the number of possible moves from a position (Warnsdorff's heuristic)
def get_degree(x, y):
    count = 0
    for dx, dy in moves:
        next_x, next_y = x + dx, y + dy
        if is_valid(next_x, next_y):
            count += 1
    return count

# Draw the chessboard and the knight's path
def draw_board(current_pos=None):
    for row in range(BOARD_SIZE):
        for col in range(BOARD_SIZE):
            # Draw the square
            color = LIGHT_BROWN if (row + col) % 2 == 0 else BROWN
            pygame.draw.rect(screen, color, (col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))

            # Draw the move number if the square has been visited
            if board[row][col] != -1:
                pygame.draw.rect(screen, YELLOW, (col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE))
                text = font.render(str(board[row][col]), True, BLACK)
                text_rect = text.get_rect(center=(col * SQUARE_SIZE + SQUARE_SIZE // 2, row * SQUARE_SIZE + SQUARE_SIZE // 2))
                screen.blit(text, text_rect)

    # Draw the knight at the current position
    if current_pos:
        row, col = current_pos
        if knight_image:
            screen.blit(knight_image, (col * SQUARE_SIZE + 5, row * SQUARE_SIZE + 5))
        else:
            pygame.draw.circle(screen, BLACK, (col * SQUARE_SIZE + SQUARE_SIZE // 2, row * SQUARE_SIZE + SQUARE_SIZE // 2), SQUARE_SIZE // 3)

    pygame.display.flip()

# Solve the Knight's Tour using backtracking and Warnsdorff's heuristic
def solve_knights_tour(x, y, move_num):
    # Mark the current position
    board[x][y] = move_num
    draw_board((x, y))
    time.sleep(DELAY)

    # Base case: if all squares are visited
    if move_num == BOARD_SIZE * BOARD_SIZE - 1:
        return True

    # Get all possible moves and sort by degree (Warnsdorff's heuristic)
    next_moves = []
    for dx, dy in moves:
        next_x, next_y = x + dx, y + dy
        if is_valid(next_x, next_y):
            degree = get_degree(next_x, next_y)
            next_moves.append((next_x, next_y, degree))
    next_moves.sort(key=lambda m: m[2])  # Sort by degree

    # Try each possible move
    for next_x, next_y, _ in next_moves:
        if solve_knights_tour(next_x, next_y, move_num + 1):
            return True

    # Backtrack: unmark the current position
    board[x][y] = -1
    draw_board((x, y))
    time.sleep(DELAY)
    return False

# Main function to start the Knight's Tour
def main():
    # Initialize the board
    draw_board()

    # Start the Knight's Tour from position (0,0)
    start_x, start_y = 0, 0
    board[start_x][start_y] = 0
    draw_board((start_x, start_y))

    # Solve the tour
    running = True
    solving = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        if solving:
            if solve_knights_tour(start_x, start_y, 0):
                print("Knight's Tour completed!")
                solving = False
            else:
                print("No solution exists starting from (0,0).")
                solving = False

        pygame.display.flip()

    # Keep the window open until the user closes it
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                return

if __name__ == "__main__":
    main()
