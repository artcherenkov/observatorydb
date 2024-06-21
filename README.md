## Инструкция по запуску

Установите зависимости
```sh
npm install
```
Запустите докер-контейнер БД
```sh
docker-compose up -d
```
Проверьте, что нужная БД (observatory) создалась. Если получаете ошибку `ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)`, просто выполните команду повторно.
```sh
docker exec -it mysql-container mysql -uroot -proot
```
затем в консоли mysql введите
```sql
SHOW DATABASES;
USE observatory;
SHOW TABLES;
SELECT * FROM Sector;
SELECT * FROM Objects;
SELECT * FROM NaturalObjects;
SELECT * FROM `Position`;
SELECT * FROM Observation;
```
Если вывелись данные, значит таблицы создались, тестовые данные вставились, а также создался триггер и процедура.

Запустите веб-сервер
```sh
node server.js
```
Перейдите по ссылке http://localhost:3000

Выберите таблицу Objects, чтобы протестировать обновление данных, а также работу триггера. Форма для обновления данных появляется внизу страницы.

Чтобы проверить работу процедуры, рекоммендую выбрать таблицу Observation, нажать кнопку "Join Tables" и в диалоговом окне ввести "Objects".