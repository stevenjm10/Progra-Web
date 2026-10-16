BEGIN;

INSERT INTO dish (name, category, description, price, available)
SELECT data.name, data.category, data.description, data.price, data.available
FROM (VALUES
    ('Seco de pollo', 'Plato fuerte', 'Pollo guisado con arroz, maduro y ensalada.', 4.50, true),
    ('Encebollado', 'Sopa', 'Sopa de pescado con yuca, cebolla y cilantro.', 3.50, true),
    ('Ceviche de camarón', 'Entrada', 'Camarones con limón, tomate, cebolla y chifles.', 6.00, true),
    ('Arroz con menestra y carne', 'Plato fuerte', 'Arroz con menestra de lentejas, carne asada y patacones.', 5.50, true),
    ('Llapingachos', 'Plato fuerte', 'Tortillas de papa con queso, chorizo, huevo y ensalada.', 4.75, true),
    ('Bolón de verde', 'Desayuno', 'Bolón de plátano verde con queso y huevo frito.', 2.75, true),
    ('Caldo de gallina', 'Sopa', 'Caldo de gallina con papa, zanahoria y cilantro.', 4.00, true),
    ('Ensalada de pollo', 'Ensalada', 'Lechuga, tomate, pepino y pollo a la plancha.', 4.25, true),
    ('Flan de caramelo', 'Postre', 'Flan casero de leche con cobertura de caramelo.', 2.00, true),
    ('Torta de chocolate', 'Postre', 'Porción de torta de chocolate con cobertura cremosa.', 2.50, false)
) AS data(name, category, description, price, available)
WHERE NOT EXISTS (
    SELECT 1 FROM dish existing
    WHERE lower(existing.name) = lower(data.name)
);

COMMIT;

SELECT id, name, category, price, available FROM dish ORDER BY id;
