FROM quay.io/keycloak/keycloak:26.4 AS build
ENV KC_DB=postgres KC_HEALTH_ENABLED=true
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.4
COPY --from=build /opt/keycloak/ /opt/keycloak/
# Se importa solo si el realm no existe; los secretos llegan por ${VARIABLES} de entorno.
COPY realm-carpeta.json /opt/keycloak/data/import/realm-carpeta.json
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--import-realm"]
