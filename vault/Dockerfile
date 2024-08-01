FROM hashicorp/vault:latest

RUN apk add --no-cache jq curl

COPY /vault_config/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
# RUN nohup sh -c "vault server -config=/vault/config/vault-config.hcl /vault/config/vault.log 2>&1" > /vault/config/log.log &



ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]`