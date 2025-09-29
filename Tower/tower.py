#!/usr/bin/env python3

"""
A playful program that prints a very tall ASCII tower using lots of print() calls.
Run it with: python3 tower.py
"""

import io
import contextlib

def main():
    # Title
    print("\n\n")
    print("                                THE TALL TOWER")
    # print("                        (drawn with many print() calls)")
    print("")

    # Sky tip / antenna
    print("                                |")
    print("                                |")
    print("                                |")
    print("                                |")
    print("                               /|\\")
    print("                              /_|_\\")
    print("                                |")
    print("                                |")
    print("                                |")
    print("                               -*-")
    print("                                |")
    print("                                |")

    # Observation deck top cap
    print("                          .----------------.")
    print("                        .'------------------'.")
    print("                       /----------------------\\")
    print("                      /------------------------\\")
    print("                     /--------------------------\\")
    print("                    /----------------------------\\")
    print("                   /------------------------------\\")
    print("                  /--------------------------------\\")

    # Observation deck sides
    print("                 |----------------------------------|")
    print("                 |----------------------------------|")
    print("                 |------------[  VIEW DECK ]--------|")
    print("                 |----------------------------------|")
    print("                 |----------------------------------|")
    print("                 |----------------------------------|")

    # Observation deck bottom cap
    print("                  \\--------------------------------/")
    print("                   \\------------------------------/")
    print("                    \\----------------------------/")
    print("                     \\--------------------------/")
    print("                      \\------------------------/")
    print("                       '.----------------------.'")
    print("                         '--------------------'")

    # Transition to shaft
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                               /____\\")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")

    # Tall shaft (lots of prints!)
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                                |  |")
    print("                               /|  |\\")
    print("                              /_|__|_\\")

    # Base platform top
    print("                         .========================.")
    print("                        /==========================\\")
    print("                       /============================\\")
    print("                      /==============================\\")
    print("                     /================================\\")

    # Base body
    print("                    |==================================|")
    print("                    |==================================|")
    print("                    |============[  BASE  ]============|")
    print("                    |==================================|")
    print("                    |==================================|")
    print("                    |==================================|")

    # Base bottom
    print("                     \\================================/")
    print("                      \\==============================/")
    print("                       \\============================/")
    print("                        \\==========================/")
    print("                         '========================'\n")

    # Ground
    print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
    print("                             Thanks for visiting the tower!\n\n")


if __name__ == "__main__":
    # Capture the printed tower, save to tower.txt, then echo to console
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        main()
    tower_text = buffer.getvalue()
    with open("tower.txt", "w", encoding="utf-8") as f:
        f.write(tower_text)
    print(tower_text, end="")


