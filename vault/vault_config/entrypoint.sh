#!/bin/sh

vault server -config=/vault/vault_config/vault-config.hcl > /vault/vault_config/vault.log 2>&1 &

apk add curl

export VAULT_ADDR='http://localhost:8200'

echo "Waiting for Vault to start..."
until curl -s http://localhost:8200/v1/sys/health; do
	sleep 2
done


echo "Initializing Vault..."
vault status &> /dev/null
if [ $? -ne 0 ]; then
  echo "Vault is not initialized or sealed. We initialize it"
  vault operator init > /vault/vault_config/init-keys.txt
  echo "Unsealing Vault..."
  vault operator unseal $(grep 'Unseal Key 1:' /vault/vault_config/init-keys.txt | awk '{print $NF}')
  vault operator unseal $(grep 'Unseal Key 2:' /vault/vault_config/init-keys.txt | awk '{print $NF}')
  vault operator unseal $(grep 'Unseal Key 3:' /vault/vault_config/init-keys.txt | awk '{print $NF}')
  vault login $(grep 'Initial Root Token:' /vault/vault_config/init-keys.txt | awk '{print $NF}')
fi

vault auth enable approle
vault secrets enable -path=secret kv-v2

vault read auth/approle/role/auth_service/role-id &> /dev/null
if [ $? -ne 0 ]; then
  echo "Creating approle..."
  vault policy write django_auth - <<EOF
  path "secret/auth_service" {
    capabilities = ["read", "create", "update", "delete", "list"]
  }
EOF
  vault write auth/approle/role/auth_service policies=django_auth
  ROLE_ID=$(vault read -field=role_id auth/approle/role/auth_service/role-id)
  echo "ROLE ID : $ROLE_ID"
  mkdir -p /vault/django/auth_service
  echo $ROLE_ID > /vadifferent ult/django/auth_service/role_id.txt
fi

SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/auth_service/secret-id)
echo $SECRET_ID> /vault/django/auth_service/secret_id.txt

echo "Congrats: Finished setting up Vault"
ps

while true; do
    sleep 1
done

# Restarting Vault server in the foreground
# echo "Restarting Vault server in the foreground..."
# pkill vault
# vault server -config=/vault/vault_config/vault-config.hcl >> /vault/vault_config/vault.log 2>&1

