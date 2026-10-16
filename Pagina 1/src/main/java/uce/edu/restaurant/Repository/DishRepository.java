package uce.edu.restaurant.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uce.edu.restaurant.Model.Dish;

public interface DishRepository extends JpaRepository<Dish, Long> {
}
