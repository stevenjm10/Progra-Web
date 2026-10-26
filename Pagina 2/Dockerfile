FROM nginx:stable-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/pagina2/
RUN sed -i 's|href="/styles.css"|href="/pagina2/styles.css"|g; s|src="/characters.js"|src="/pagina2/characters.js"|g' /usr/share/nginx/html/pagina2/index.html
EXPOSE 80
