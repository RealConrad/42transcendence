FROM hashicorp/vault:latest

RUN apk add --no-cache jq curl

COPY /vault_config/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
# RUN nohup sh -c "vault server -config=/vault/config/vault-config.hcl /vault/config/vault.log 2>&1" > /vault/config/log.log &
# RUN ./usr/local/bin/entrypoint.sh


CMD ["/usr/local/bin/entrypoint.sh"]
# ENTRYPOINT ["vault server -config=/vault/vault_config/vault-config.hcl"]