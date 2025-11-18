# Medplum

## Setup
(kubernetes folder)
kubectl apply -f volumes.yaml 

(medplum folder)
kubectl apply -f .\medplum-configmap.yaml -f .\medplum-postgres-secret.yaml -f .\medplum-postgres-deployment.yaml -f .\medplum-postgres-service.yaml

kubectl get pods
NAME                              READY   STATUS    RESTARTS   AGE
medplum-postgres-c6c6586f-cnwlb   1/1     Running   0          2d22h
medplum-redis-7fbd9cd8fc-ptx75    1/1     Running   0          28m
medplum-server-6689477f7-c8crl    1/1     Running   0          28m
tb-postgres-56549998dc-mlb8r      0/1     Running   0          20s

kubectl cp medplum_dump.sql default/medplum-postgres-c6c6586f-cnwlb:/tmp/medplum_dump.sql
kubectl exec -it medplum-postgres-c6c6586f-cnwlb -- bash

(inside pod)
cd tmp/
psql -U medplum -d medplum < medplum_dump.sql

(check if it worked)
`psql -U medplum -d medplum -c "SELECT * from pg_tables;"`
(check data version in case of medplum-server error)
`psql -U medplum -d medplum`
`SELECT * from "DatabaseMigration" order by id desc limit 1;`
 id | version | dataVersion | firstBoot
----+---------+-------------+-----------
  1 |      98 |          27 | f
(1 row)

(medplum folder)
kubectl apply -f .\medplum-redis-deployment.yaml -f .\medplum-redis-service.yaml
kubectl apply -f .\medplum-deployment.yaml -f .\medplum-service.yaml
