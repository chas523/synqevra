# Thingsboard

## Setup
(kubernetes folder)
kubectl apply -f volumes.yaml

kubectl apply -f .\tb-postgres-secret.yaml -f .\tb-postgres-deployment.yaml -f .\tb-postgres-service.yaml

kubectl get pods
NAME                              READY   STATUS    RESTARTS   AGE
medplum-postgres-c6c6586f-cnwlb   1/1     Running   0          2d22h
medplum-redis-7fbd9cd8fc-ptx75    1/1     Running   0          28m
medplum-server-6689477f7-c8crl    1/1     Running   0          28m
tb-postgres-56549998dc-mlb8r      0/1     Running   0          20s

kubectl cp thingsboard_dump.sql default/tb-postgres-56549998dc-mlb8r:/tmp/thingsboard_dump.sql
kubectl exec -it tb-postgres-56549998dc-mlb8r -- bash

(inside pod)
cd tmp/
psql -U postgres -d thingsboard < thingsboard_dump.sql

(check if it worked)
`psql -U postgres -d thingsboard -c "SELECT * from pg_tables;"`