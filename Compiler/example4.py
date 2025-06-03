# Herencia avanzada usando SUPER

class Vehicle:
    def __init__(self, make):
        self.make = make

    def start(self):
        print("Starting vehicle")

class Car(Vehicle):
    def __init__(self, make, model):
        super().__init__(make)
        self.model = model

    def start(self):
        super().start()
        print(f"Starting car {self.make} {self.model}")

my_car = Car("Toyota", "Corolla")
my_car.start()
