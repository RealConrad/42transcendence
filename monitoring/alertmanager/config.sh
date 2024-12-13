#!/bin/bash

cat <<EOF > /etc/alertmanager/alertmanager.yml
route:
  receiver: 'default'
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 5m
  repeat_interval: 1h

receivers:
  - name: 'default'
    email_configs:
      - to: '${TO}'
        from: '${FROM}'
        smarthost: '${SMTP_HOST}'
        auth_username: '${AUTH_USERNAME}'
        auth_password: '${AUTH_PASSWORD}'
EOF

/bin/alertmanager --config.file=/etc/alertmanager/alertmanager.yml



