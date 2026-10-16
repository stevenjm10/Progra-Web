package uce.edu.restaurant.Service;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import uce.edu.restaurant.Model.Dish;
import uce.edu.restaurant.Repository.DishRepository;

@Service
public class DishService {
    private final DishRepository repository;

    public DishService(DishRepository repository) {
        this.repository = repository;
    }

    public List<Dish> list() {
        return repository.findAll(Sort.by("id"));
    }

    public Dish findById(Long id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Platillo no encontrado"));
    }

    public Dish create(Dish dish) {
        validate(dish);
        dish.setId(null);
        return repository.save(dish);
    }

    public Dish update(Long id, Dish data) {
        Dish dish = findById(id);
        validate(data);
        dish.setName(data.getName());
        dish.setDescription(data.getDescription());
        dish.setCategory(data.getCategory());
        dish.setPrice(data.getPrice());
        dish.setAvailable(data.getAvailable());
        return repository.save(dish);
    }

    public void delete(Long id) {
        repository.delete(findById(id));
    }

    private void validate(Dish dish) {
        if (dish.getName() == null || dish.getName().isBlank()
                || dish.getName().length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio (máximo 100 caracteres)");
        }
        if (dish.getCategory() == null || dish.getCategory().isBlank()
                || dish.getCategory().length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La categoría es obligatoria (máximo 100 caracteres)");
        }
        if (dish.getDescription() != null && dish.getDescription().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La descripción admite hasta 500 caracteres");
        }
        BigDecimal price = dish.getPrice();
        if (price == null || price.signum() < 0 || price.scale() > 2
                || price.compareTo(new BigDecimal("99999999.99")) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indica un precio válido con hasta dos decimales");
        }
        dish.setName(dish.getName().trim());
        dish.setCategory(dish.getCategory().trim());
        if (dish.getAvailable() == null) { dish.setAvailable(true); }
    }
}
