---
title: Many-to-Many Relationships
type: 
tags:
  - area/swiftui
  - swiftui/swiftdata
date: 2025-04-05 21:25
last edited: 2025-04-05 21:26
uid: 20250405212555
---
## Concept  

- Many-to-many relationships occur when records in one table can relate to multiple records in another.  
- A join table is used to map these relationships.

## Example  

- **Exercise Table:** Has a primary key `exerciseID`.  
- **Workout Table:** Has a primary key `workoutID`.  
- **WorkoutExercise Join Table:** Uses both `workoutID` and `exerciseID` as foreign keys, allowing exercises to appear in multiple workouts.

## Source  

- [Wikipedia - Database Schema](https://en.wikipedia.org/wiki/Database_schema)

