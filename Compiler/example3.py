# HYBRID 

class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def move(self, dx, dy):
        self.x += dx
        self.y += dy

def display_point(p):
    print(f"Point at ({p.x}, {p.y})")

p1 = Point(2, 3)
display_point(p1)
p1.move(1, -1)
display_point(p1)
