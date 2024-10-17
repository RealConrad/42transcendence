storage "file" {
  path = "/vault/file"
}

listener "tcp" {
  address     = "localhost:8200"
  tls_disable = 1
}

api_addr = "http://localhost:8200"
cluster_addr = "http://localhost:8201"

ui = true