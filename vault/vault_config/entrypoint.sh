#!/bin/sh

nohup sh -c "vault server -config=/vault/config/vault-config.hcl /vault/config/vault.log 2>&1" > /vault/config/log.log &

apk add curl

echo "Waiting for Vault to start..."
until curl -s http://127.0.0.1:8200/v1/sys/health; do
	sleep 2
done

export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_DEV_ROOT_TOKEN_ID="root"

echo "Initializing Vault..."
vault operator init > /vault/config/init-keys.txt

echo "Unsealing Vault..."
vault operator unseal $(grep 'Unseal Key 1:' /vault/config/init-keys.txt | awk '{print $NF}')
vault operator unseal $(grep 'Unseal Key 2:' /vault/config/init-keys.txt | awk '{print $NF}')
vault operator unseal $(grep 'Unseal Key 3:' /vault/config/init-keys.txt | awk '{print $NF}')
vault login $(grep 'Initial Root Token:' /vault/config/init-keys.txt | awk '{print $NF}')



vault secrets enable -path=secret kv-v2

vault policy write auth - << EOF
path "secret/auth"{
	capabilities=["read", "create", "update", "delete", "list"]
}
EOF

vault operator seal
pgrep -f vault | xargs kill
vault server -config=/vault/config/vault-config.hcl /vault/config/vault.log
