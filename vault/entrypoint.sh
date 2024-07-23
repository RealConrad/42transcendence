#!/bin/sh

vault server -config=/vault/config/vault-config.hcl

# Wait for Vault to be ready
echo "Waiting for Vault to start..."
until curl -s http://127.0.0.1:8200/v1/sys/health; do
  sleep 2
done

export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_DEV_ROOT_TOKEN_ID="root"

  echo "Initializing Vault..."
  vault operator init > /vault/init-keys.txt

  UNSEAL_KEY=$(grep 'Unseal Key 1:' /vault/init-keys.txt | awk -F ': ' '{print $2}')
  ROOT_TOKEN=$(grep 'Initial Root Token:' /vault/init-keys.txt | awk -F ': ' '{print $2}')

  echo "Unsealing Vault..."
  vault operator unseal $UNSEAL_KEY

  echo "Vault initialized and unsealed."
  echo "Root Token: $ROOT_TOKEN"
else
  echo "Vault is already initialized."
fi

vault server -config=/vault/config/vault-config.hcl
