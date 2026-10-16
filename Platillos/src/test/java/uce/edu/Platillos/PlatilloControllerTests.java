package uce.edu.Platillos;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uce.edu.Platillos.Controller.PlatilloController;
import uce.edu.Platillos.Model.Platillo;
import uce.edu.Platillos.Repository.PlatilloRepository;
import uce.edu.Platillos.Service.PlatilloService;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class PlatilloControllerTests {
    private PlatilloRepository repository;
    private MockMvc mvc;

    @BeforeEach
    void configurar() {
        repository = mock(PlatilloRepository.class);
        mvc = MockMvcBuilders.standaloneSetup(new PlatilloController(new PlatilloService(repository))).build();
    }

    private Platillo ejemplo() {
        Platillo p = new Platillo();
        p.setId(1L);
        p.setNombre("Seco de pollo");
        p.setCategoria("Plato fuerte");
        p.setPrecio(new BigDecimal("4.50"));
        return p;
    }

    @Test
    void listarDevuelveJsonOrdenado() throws Exception {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of(ejemplo()));
        mvc.perform(get("/api/platillos")).andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Seco de pollo"));
        verify(repository).findAll(Sort.by("id"));
    }

    @Test
    void buscarInexistenteDevuelve404() throws Exception {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        mvc.perform(get("/api/platillos/99")).andExpect(status().isNotFound());
    }

    @Test
    void buscarExistenteDevuelvePlatillo() throws Exception {
        when(repository.findById(1L)).thenReturn(Optional.of(ejemplo()));
        mvc.perform(get("/api/platillos/1")).andExpect(status().isOk())
            .andExpect(jsonPath("$.precio").value(4.5));
    }

    @Test
    void crearIgnoraIdEnviadoYDevuelve201() throws Exception {
        when(repository.save(any(Platillo.class))).thenAnswer(invocacion -> {
            Platillo p = invocacion.getArgument(0);
            assertNull(p.getId());
            p.setId(8L);
            return p;
        });
        mvc.perform(post("/api/platillos").contentType("application/json")
            .content("{\"id\":99,\"nombre\":\" Sopa \",\"categoria\":\"Entrada\",\"precio\":2.50}"))
            .andExpect(status().isCreated()).andExpect(header().string("Location", "/api/platillos/8"))
            .andExpect(jsonPath("$.nombre").value("Sopa"));
    }

    @Test
    void precioNegativoYNombreVacioNoSeGuardan() throws Exception {
        for (String datos : List.of(
            "{\"nombre\":\"Sopa\",\"categoria\":\"Entrada\",\"precio\":-1}",
            "{\"nombre\":\"  \",\"categoria\":\"Entrada\",\"precio\":1}",
            "{\"nombre\":\"Sopa\",\"categoria\":\"Entrada\",\"precio\":1.234}")) {
            mvc.perform(post("/api/platillos").contentType("application/json").content(datos))
                .andExpect(status().isBadRequest());
        }
        verify(repository, never()).save(any());
    }

    @Test
    void actualizarRespetaIdDeLaRuta() throws Exception {
        when(repository.findById(1L)).thenReturn(Optional.of(ejemplo()));
        when(repository.save(any(Platillo.class))).thenAnswer(invocacion -> invocacion.getArgument(0));
        mvc.perform(put("/api/platillos/1").contentType("application/json")
            .content("{\"id\":99,\"nombre\":\"Ensalada\",\"categoria\":\"Entrada\",\"precio\":3,\"disponible\":false}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nombre").value("Ensalada"))
            .andExpect(jsonPath("$.disponible").value(false));
    }

    @Test
    void actualizarInexistenteNoCreaOtroRegistro() throws Exception {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        mvc.perform(put("/api/platillos/99").contentType("application/json")
            .content("{\"nombre\":\"Sopa\",\"categoria\":\"Entrada\",\"precio\":2}"))
            .andExpect(status().isNotFound());
        verify(repository, never()).save(any());
    }

    @Test
    void eliminarDevuelve204YCompruebaExistencia() throws Exception {
        Platillo p = ejemplo();
        when(repository.findById(1L)).thenReturn(Optional.of(p));
        mvc.perform(delete("/api/platillos/1")).andExpect(status().isNoContent());
        verify(repository).delete(p);
        mvc.perform(delete("/api/platillos/99")).andExpect(status().isNotFound());
    }
}
