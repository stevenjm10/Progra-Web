package uce.edu.Platillos.Controller;

import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uce.edu.Platillos.Model.Platillo;
import uce.edu.Platillos.Service.PlatilloService;

@RestController
@RequestMapping("/api/platillos")
public class PlatilloController {
    private final PlatilloService service;

    public PlatilloController(PlatilloService service) { this.service = service; }

    @GetMapping
    public List<Platillo> listar() { return service.listar(); }

    @GetMapping("/{id}")
    public Platillo buscar(@PathVariable("id") Long id) { return service.buscar(id); }

    @PostMapping
    public ResponseEntity<Platillo> crear(@RequestBody Platillo platillo) {
        Platillo guardado = service.crear(platillo);
        return ResponseEntity.created(URI.create("/api/platillos/" + guardado.getId())).body(guardado);
    }

    @PutMapping("/{id}")
    public Platillo actualizar(@PathVariable("id") Long id, @RequestBody Platillo datos) {
        return service.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
