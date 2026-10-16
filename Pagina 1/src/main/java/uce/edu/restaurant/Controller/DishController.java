package uce.edu.restaurant.Controller;

import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uce.edu.restaurant.Model.Dish;
import uce.edu.restaurant.Service.DishService;

@RestController
@RequestMapping("/api/dishes")
public class DishController {
    private final DishService service;

    public DishController(DishService service) { this.service = service; }

    @GetMapping
    public List<Dish> list() { return service.list(); }

    @GetMapping("/{id}")
    public Dish findById(@PathVariable("id") Long id) { return service.findById(id); }

    @PostMapping
    public ResponseEntity<Dish> create(@RequestBody Dish dish) {
        Dish saved = service.create(dish);
        return ResponseEntity.created(URI.create("/api/dishes/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public Dish update(@PathVariable("id") Long id, @RequestBody Dish data) {
        return service.update(id, data);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
