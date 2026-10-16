-- Preserve existing data while upgrading legacy Spanish identifiers to English.
BEGIN;
DO $$
BEGIN
    IF to_regclass('public.dish') IS NULL AND to_regclass('public.platillo') IS NOT NULL THEN
        ALTER TABLE public.platillo RENAME TO dish;
        ALTER TABLE public.dish RENAME COLUMN nombre TO name;
        ALTER TABLE public.dish RENAME COLUMN categoria TO category;
        ALTER TABLE public.dish RENAME COLUMN descripcion TO description;
        ALTER TABLE public.dish RENAME COLUMN precio TO price;
        ALTER TABLE public.dish RENAME COLUMN disponible TO available;
        ALTER SEQUENCE IF EXISTS public.platillo_id_seq RENAME TO dish_id_seq;
    END IF;
END $$;
COMMIT;
