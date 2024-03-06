1. Running in docker container 
docker-compose up --build

2. '.env' file sample - 
host=mysql.sample.com
user=testadmin
password=testpassword
database=testdb
mysqlPort=3000
serverPort=3000

3. authorization token(JWT) in headers - 
Payload for JWT token -
{
  "userId": "user",
  "userRole": "admin",
  "iat": 1709409022000,
  "exp": 1711409022000
}
* 'iat' & 'exp' in ms.

4. Postman collection file name "qp-assessment_postman.json" in root dir.
