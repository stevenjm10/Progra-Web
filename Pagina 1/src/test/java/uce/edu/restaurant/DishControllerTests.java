package uce.edu.restaurant;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import uce.edu.restaurant.Controller.DishController;
import uce.edu.restaurant.Model.Dish;
import uce.edu.restaurant.Repository.DishRepository;
import uce.edu.restaurant.Service.DishService;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class DishControllerTests {
    private DishRepository repository;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        repository = mock(DishRepository.class);
        mvc = MockMvcBuilders.standaloneSetup(new DishController(new DishService(repository))).build();
    }

    private Dish sample() {
        Dish p = new Dish();
        p.setId(1L);
        p.setName("Seco de pollo");
        p.setCategory("Plato fuerte");
        p.setPrice(new BigDecimal("4.50"));
        return p;
    }

    @Test
    void listsDishesSortedById() throws Exception {
        when(repository.findAll(any(Sort.class))).thenReturn(List.of(sample()));
        mvc.perform(get("/api/dishes")).andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Seco de pollo"));
        verify(repository).findAll(Sort.by("id"));
    }

    @Test
    void missingDishReturns404() throws Exception {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        mvc.perform(get("/api/dishes/99")).andExpect(status().isNotFound());
    }

    @Test
    void existingDishReturns200() throws Exception {
        when(repository.findById(1L)).thenReturn(Optional.of(sample()));
        mvc.perform(get("/api/dishes/1")).andExpect(status().isOk())
            .andExpect(jsonPath("$.price").value(4.5));
    }

    @Test
    void creationIgnoresSubmittedIdAndReturns201() throws Exception {
        when(repository.save(any(Dish.class))).thenAnswer(invocation -> {
            Dish p = invocation.getArgument(0);
            assertNull(p.getId());
            p.setId(8L);
            return p;
        });
        mvc.perform(post("/api/dishes").contentType("application/json")
            .content("{\"id\":99,\"name\":\" Sopa \",\"category\":\"Entrada\",\"price\":2.50}"))
            .andExpect(status().isCreated()).andExpect(header().string("Location", "/api/dishes/8"))
            .andExpect(jsonPath("$.name").value("Sopa"));
    }

    @Test
    void invalidFieldsAreNotSaved() throws Exception {
        for (String data : List.of(
            "{\"name\":\"Sopa\",\"category\":\"Entrada\",\"price\":-1}",
            "{\"name\":\"  \",\"category\":\"Entrada\",\"price\":1}",
            "{\"name\":\"Sopa\",\"category\":\"Entrada\",\"price\":1.234}")) {
            mvc.perform(post("/api/dishes").contentType("application/json").content(data))
                .andExpect(status().isBadRequest());
        }
        verify(repository, never()).save(any());
    }

    @Test
    void updateUsesPathId() throws Exception {
        when(repository.findById(1L)).thenReturn(Optional.of(sample()));
        when(repository.save(any(Dish.class))).thenAnswer(invocation -> invocation.getArgument(0));
        mvc.perform(put("/api/dishes/1").contentType("application/json")
            .content("{\"id\":99,\"name\":\"Ensalada\",\"category\":\"Entrada\",\"price\":3,\"available\":false}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.name").value("Ensalada"))
            .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void updatingMissingDishDoesNotCreateRecord() throws Exception {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        mvc.perform(put("/api/dishes/99").contentType("application/json")
            .content("{\"name\":\"Sopa\",\"category\":\"Entrada\",\"price\":2}"))
            .andExpect(status().isNotFound());
        verify(repository, never()).save(any());
    }

    @Test
    void deletionChecksExistenceAndReturns204() throws Exception {
        Dish p = sample();
        when(repository.findById(1L)).thenReturn(Optional.of(p));
        mvc.perform(delete("/api/dishes/1")).andExpect(status().isNoContent());
        verify(repository).delete(p);
        mvc.perform(delete("/api/dishes/99")).andExpect(status().isNotFound());
    }
}
