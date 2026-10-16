package uce.edu.Platillos.Service;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import uce.edu.Platillos.Model.Platillo;
import uce.edu.Platillos.Repository.PlatilloRepository;

@Service
public class PlatilloService {
    private final PlatilloRepository repository;

    public PlatilloService(PlatilloRepository repository) {
        this.repository = repository;
    }

    public List<Platillo> listar() {
        return repository.findAll(Sort.by("id"));
    }

    public Platillo buscar(Long id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Platillo no encontrado"));
    }

    public Platillo crear(Platillo platillo) {
        validar(platillo);
        platillo.setId(null);
        return repository.save(platillo);
    }

    public Platillo actualizar(Long id, Platillo datos) {
        Platillo platillo = buscar(id);
        validar(datos);
        platillo.setNombre(datos.getNombre());
        platillo.setDescripcion(datos.getDescripcion());
        platillo.setCategoria(datos.getCategoria());
        platillo.setPrecio(datos.getPrecio());
        platillo.setDisponible(datos.getDisponible());
        return repository.save(platillo);
    }

    public void eliminar(Long id) {
        repository.delete(buscar(id));
    }

    private void validar(Platillo platillo) {
        if (platillo.getNombre() == null || platillo.getNombre().isBlank()
                || platillo.getNombre().length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio (máximo 100 caracteres)");
        }
        if (platillo.getCategoria() == null || platillo.getCategoria().isBlank()
                || platillo.getCategoria().length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La categoría es obligatoria (máximo 100 caracteres)");
        }
        if (platillo.getDescripcion() != null && platillo.getDescripcion().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La descripción admite hasta 500 caracteres");
        }
        BigDecimal precio = platillo.getPrecio();
        if (precio == null || precio.signum() < 0 || precio.scale() > 2
                || precio.compareTo(new BigDecimal("99999999.99")) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indica un precio válido con hasta dos decimales");
        }
        platillo.setNombre(platillo.getNombre().trim());
        platillo.setCategoria(platillo.getCategoria().trim());
        if (platillo.getDisponible() == null) { platillo.setDisponible(true); }
    }
}
