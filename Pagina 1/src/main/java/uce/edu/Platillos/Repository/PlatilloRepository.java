package uce.edu.Platillos.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import uce.edu.Platillos.Model.Platillo;

public interface PlatilloRepository extends JpaRepository<Platillo, Long> {
}
