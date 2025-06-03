# OOP Code

class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        print(self.name + " makes a sound.")

class Dog(Animal):
    def speak(self):
        print(self.name + " barks.")

my_dog = Dog("Fido")
my_dog.speak()
